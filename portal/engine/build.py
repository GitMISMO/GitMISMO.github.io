#!/usr/bin/env python3
"""Builds the sample certification portals: portal/<program>/index.html for every company certification.

Run from the repository root:  python3 portal/engine/build.py
The questions come from the live forms (forms/<program>/index.html: var APP = the application, var FORMS = the
questionnaires), so a portal always asks what the real form asks. Everything else (journey, steps, the made-up
sample company) is set below. The pages load portal/engine/portal.js and portal.css. Nothing in them sends anything.
The AI Governance portal (portal/ai-governance/) is its own page and is not built here.
Jonna, 21 Nov 2026: "one each of the certifications so i can show them".
"""
import json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LOGO = open(os.path.join(os.path.dirname(__file__), "logo-symbol.svg")).read().strip()


def form_defs(name):
    s = open(os.path.join(ROOT, "forms", name, "index.html"), encoding="utf-8").read()
    out = {}
    for var in ("APP", "FORMS"):
        i = s.find("var " + var)
        if i < 0:
            continue
        j = s.index("=", i) + 1
        out[var], _ = json.JSONDecoder().raw_decode(s[j:].lstrip())
    return out


EM, PR, CO, FR = form_defs("emortgage"), form_defs("product"), form_defs("consultant"), form_defs("frame")
DROP_FIELDS = {"sameAsContact", "kind", "releases"}


def sections(app, headings, rename=None):
    out = []
    for sec in app["sections"]:
        if sec["heading"] not in headings:
            continue
        s = dict(sec)
        s["fields"] = [f for f in sec.get("fields", []) if f["key"] not in DROP_FIELDS]
        if rename and sec["heading"] in rename:
            s["heading"] = rename[sec["heading"]]
        out.append(s)
    return out


def fold_reading(secs):
    """Sections that only explain (no questions) become a Before You Start note on the first section with questions."""
    out, pre = [], []
    for s in secs:
        if not s.get("items") and not s.get("tables") and not s.get("blocks"):
            if s.get("intro"):
                paras = [x.replace("section 11, Supporting Documentation", "the Supporting Documents step") for x in s["intro"]]
                pre.append({"heading": re.sub(r"^\d+\.\s*", "", s["heading"]), "paras": paras})
            continue
        if pre:
            s = dict(s, pre=pre)
            pre = []
        out.append(s)
    return out


def questionnaire(app_forms, code):
    f = [x for x in app_forms if x["code"] == code][0]
    return {"label": f["label"], "sections": f["sections"]}


def prefill_blocks(form, values):
    """Fill the questionnaire's own 'About the provider' box from the sample company (section 0, first table)."""
    out = {}
    for si, s in enumerate(form["sections"]):
        for ti, t in enumerate(s.get("tables") or []):
            if t.get("kind") != "field_block" or si != 0:
                continue
            v = {}
            for i, f in enumerate(t.get("fields", [])):
                v[f] = values["product"] if i == 0 else values["contact"] if "Name" in f else values["contactEmail"] if "Email" in f else values["contactPhone"] if "Phone" in f else ""
            out["%d-t%d" % (si, ti)] = v
    return out


def requested_docs(form):
    for s in form["sections"]:
        for t in s.get("tables") or []:
            if t.get("kind") == "checkbox_grid" and t.get("options"):
                return t["options"]
    return []


def slugify(x):
    return re.sub(r"[^a-z0-9]+", "-", x.lower()).strip("-")[:40]


def org_values(org, street, city, state, zipc, years, contact, title, email, phone, signer, stitle, semail, website, extra=None):
    v = {"org": org, "website": website, "street": street, "city": city, "state": state, "zip": zipc, "yearsInBusiness": years,
         "contact": contact, "contactTitle": title, "contactEmail": email, "contactPhone": phone,
         "signer": signer, "signerTitle": stitle, "signerEmail": semail}
    v.update(extra or {})
    return v


def docs(*rows):
    return [{"id": "s%d" % i, "name": n, "size": z, "area": a} for i, (n, z, a) in enumerate(rows)]


EM_JOURNEY = [["Applied", "Website form"], ["Agreement and Fee", "DocuSign and invoice"], ["Your Submission", "Questionnaire and documents"],
              ["Scope Review", "The assessor"], ["Demonstration", "With the assessor"], ["Results", "MISMO decides"], ["Certified", "Mark License"]]
EM_AFTER = ["MISMO checks your submission is complete, usually within two business days.",
            "Your assessor reviews the scope and confirms your demonstration date.",
            "You demonstrate the system; the assessor records the results.",
            "Anything that needs fixing comes back to you here, with what to fix and a date.",
            "MISMO decides, and once you pass, the Mark License Agreement goes to you by DocuSign."]
EM_ATTEST = "I am authorized to submit this for the organization. The answers and documents are accurate and complete to the best of my knowledge."


def emortgage(code, key, name, noun, co, answers, docrows):
    form = questionnaire(EM["FORMS"], code)
    req = requested_docs(form)
    areas = [{"code": "req%d" % i, "name": r[:1].upper() + r[1:], "help": "Asked for in the questionnaire."} for i, r in enumerate(req)]
    areas += [{"code": "demo", "name": "Demo Artifacts", "help": "Screenshots, exports and recordings from your demonstration. Add them after the demo.", "optional": True},
              {"code": "other", "name": "Anything Else", "help": "Anything your answers refer to.", "optional": True}]
    prods = co.pop("products")
    answers = dict(prefill_blocks(form, dict(co, product=prods[0]["name"])), **answers)
    return {
        "key": key, "programName": name + " Certification", "kicker": "MISMO " + name + " Certification · Initial · Sample",
        "heroSub": "Five steps. Check your " + noun + " details, answer the " + name + " questionnaire, add the documents it asks for, book your demonstration, then send it to MISMO. Everything saves as you go.",
        "meta": [["Company", co["org"]], ["Version", prods[0]["version"]], ["Assessor", "Assigned by MISMO"]],
        "journey": EM_JOURNEY, "now": 2, "code": "615204",
        "inviteWhen": "Once the agreement is signed and the invoice is paid, MISMO opens the company's portal and this invitation goes to the primary contact.",
        "inviteStep": "Agreement signed, invoice paid.",
        "inviteBody": "Thank you, your payment has been received. Your certification portal for " + prods[0]["name"] + " is ready. It's where you answer the " + name + " questionnaire, add your documents and book your demonstration.",
        "inviteRows": [["Product", prods[0]["name"] + " " + prods[0]["version"]], ["Certification", name + ", initial"], ["Questionnaire", form["label"]]],
        "attestation": EM_ATTEST, "after": EM_AFTER,
        "sample": {"org": co["org"], "subject": prods[0]["name"], "contactName": co["contact"], "contactEmail": co["contactEmail"], "signerName": co["signer"],
                   "values": co, "reps": {"products": prods}, "answers": answers, "docs": docrows},
        "steps": [
            {"type": "fields", "title": "About Your " + noun.title(), "intro": "We filled in what your application already told us. Check it, add anything missing, and confirm.",
             "sections": sections(EM["APP"], ["Your Organization", "Primary Contact", "Authorized Signer", "The Product", "Deployment", "Integrations"])},
            {"type": "questionnaire", "title": form["label"], "intro": "The " + name + " questionnaire, section by section. Answers save as you type; come back any time.", "form": form},
            {"type": "docs", "title": "Your Documents", "intro": "The documents the questionnaire asks for. Demo artifacts come after your demonstration.", "areas": areas},
            {"type": "booking", "id": "demo", "title": "Book Your Demonstration", "offset": 12, "length": "90 minutes", "from": "Your Assessor",
             "intro": "Pick one of the times your assessor has offered. You will show the " + noun + " working against the MISMO " + name + " requirements.",
             "confirm": "Your assessor and certifications@mismo.org are told, and a calendar invitation follows from the assessor.",
             "prep": ["Have a test environment ready with sample loans and documents (no real borrower data).", "Your assessor tells you beforehand what to show; plan to walk through each MISMO requirement in turn.",
                      "Capture the screenshots and exports the script names; add them under Demo Artifacts afterwards."]},
            {"type": "review", "title": "Review and Submit"}]}


cfgs = {}

# ---------- RON ----------
cfgs["ron"] = emortgage("RON", "ron", "RON", "platform",
    dict(org_values("Lakeshore Notary Systems, Inc.", "200 Harbor Point Drive, Suite 400", "Chicago", "IL", "60601", 9, "Alex Rivera", "Director of Compliance",
                    "alex.rivera@lakeshore.example", "312-555-0142", "Morgan Lee", "Chief Executive Officer", "morgan.lee@lakeshore.example", "https://lakeshore.example",
                    {"isMember": "Yes", "inProduction": "Yes", "deployedOn": "2023-04-17", "integrations": "Yes",
                     "integrationDetail": "Identity proofing and credential analysis come from a third-party identity provider through its API. Signed packages are delivered to lender eVaults over a MISMO-conformant interface."}),
         products=[{"name": "Lakeshore RON Studio", "website": "", "version": "5.1"}]),
    {"1-1": "Illinois, Indiana, Michigan, Minnesota, Ohio, Texas, Florida, Virginia and 31 other states (full list attached as RON-State-Coverage.pdf).",
     "1-3": "Four of five questions, within two minutes, with one retry on a new question set as state law allows.",
     "1-4": "A third-party credential analysis provider checks the front and back of government ID for security features; results are stored with the session.",
     "1-5": "Yes. Notaries sign in with a password and a one-time code from an authenticator app on every session."},
    docs(("Lakeshore-Notary-User-Guide.pdf", 1840000, "req0"), ("Lakeshore-KBA-Process.pdf", 310000, "req1"), ("RON-State-Coverage.pdf", 220000, "other")))

# ---------- eClosing ----------
cfgs["eclosing"] = emortgage("ECLOSING", "eclosing", "eClosing", "system",
    dict(org_values("Harborline Closing Technologies, LLC", "18 Commerce Square", "Charlotte", "NC", "28202", 12, "Priya Shah", "VP, Product",
                    "priya.shah@harborline.example", "704-555-0188", "Daniel Ortiz", "President", "daniel.ortiz@harborline.example", "https://harborline.example",
                    {"isMember": "Yes", "inProduction": "Yes", "deployedOn": "2021-09-08", "integrations": "Yes",
                     "integrationDetail": "Integrates with two loan origination systems for document packages and with an eVault provider for eNote registration and transfer."}),
         products=[{"name": "Harborline eClose", "website": "", "version": "3.4"}]),
    {"1-1": {"yn": "Yes", "explain": "Annual SOC 2 Type II; privacy program aligned with GLBA and state privacy laws."},
     "1-2": {"yn": "Yes", "explain": "Knowledge-based authentication plus a one-time passcode by text or email; lenders can require both."},
     "1-3": "Click-to-sign and typed signatures, each applied by a separate affirmative act and bound to the signer's session."},
    docs(("Harborline-SOC2-Type-II-2026.pdf", 2650000, "req0")))

# ---------- eVault ----------
cfgs["evault"] = emortgage("EVAULT", "evault", "eVault", "system",
    dict(org_values("Granite Peak Vault Co.", "77 Summit Avenue", "Denver", "CO", "80202", 15, "Jordan Blake", "Head of Partnerships",
                    "jordan.blake@granitepeak.example", "303-555-0110", "Casey Morgan", "Chief Operating Officer", "casey.morgan@granitepeak.example", "https://granitepeak.example",
                    {"isMember": "No", "inProduction": "Yes", "deployedOn": "2019-02-11", "integrations": "Yes",
                     "integrationDetail": "Registers eNotes with the MERS eRegistry and exchanges transfers of control and location with other eVaults."}),
         products=[{"name": "Granite Peak eVault", "website": "", "version": "7.2"}]),
    {"1-1": "Yes. eNotes and all other Electronic Records in the loan file are stored together in the same tamper-evident repository.",
     "1-2": "For the life of the loan plus seven years, in their original format, unless the lender sets a longer period.",
     "1-5": "Single sign-on through the lender's identity provider, or username and password with required multi-factor authentication.",
     "1-14": ["SMART Doc® v1.02", "SMART Doc® v3 Verifiable"]},
    docs(("Granite-Peak-Business-Continuity-Plan.pdf", 990000, "req0"), ("Granite-Peak-Disaster-Recovery-Plan.pdf", 1210000, "req1")))

# ---------- Product ----------
pv = org_values("Bluewater Data Systems, Inc.", "5 Riverside Plaza", "Columbus", "OH", "43215", 7, "Sam Patel", "Integration Lead",
                "sam.patel@bluewater.example", "614-555-0173", "Taylor Brooks", "Chief Technology Officer", "taylor.brooks@bluewater.example", "https://bluewater.example",
                {"size": "101 to 500", "targetDate": ""})
cfgs["product"] = {
    "key": "product", "programName": "Product Certification", "kicker": "MISMO Product Certification · Initial · Sample",
    "heroSub": "Five steps. Check your product details, book the pre-assessment call, add your specification and data files, book your demonstration, then send it to MISMO.",
    "meta": [["Company", pv["org"]], ["MISMO Version", "3.6"], ["Data Points", pv["size"]]],
    "journey": [["Applied", "Website form"], ["Agreement and Fee", "DocuSign and invoice"], ["Pre-Assessment", "Call with the assessor"], ["Your Submission", "Files and data"],
                ["Demonstration", "With the assessor"], ["Results", "MISMO decides"], ["Certified", "Mark License"]],
    "now": 2, "code": "615204",
    "inviteWhen": "Once the agreement is signed and the invoice is paid, MISMO opens the company's portal and this invitation goes to the primary contact.",
    "inviteStep": "Agreement signed, invoice paid.",
    "inviteBody": "Thank you, your payment has been received. Your certification portal for Bluewater LOS Connector is ready. It's where you book your pre-assessment call, add your specification and data files, and book your demonstration.",
    "inviteRows": [["Product", "Bluewater LOS Connector"], ["MISMO Version", "3.6"], ["Data Points", "101 to 500"]],
    "attestation": EM_ATTEST,
    "after": ["MISMO checks your files are complete.", "Your assessor reviews the files against the MISMO specification before the demonstration.",
              "You demonstrate the product; the assessor records the results.", "Anything that needs fixing comes back to you here, with a date.",
              "MISMO decides, and once you pass, the Mark License Agreement goes to you by DocuSign."],
    "sample": {"org": pv["org"], "subject": "Bluewater LOS Connector", "contactName": pv["contact"], "contactEmail": pv["contactEmail"], "signerName": pv["signer"],
               "values": pv, "reps": {"products": [{"name": "Bluewater LOS Connector", "interface": "Loan Data Export API", "mismoVersion": "3.6",
                                                     "productDesc": "Moves loan data from the loan origination system to investors and service providers as MISMO 3.6 XML.",
                                                     "interfaceDesc": "A REST interface that returns a MISMO 3.6 message for a loan, validated against the MISMO schema before it is sent."}]},
               "answers": {}, "docs": docs(("Bluewater-MISMO-3.6-Mapping.xlsx", 410000, "spec"), ("Sample-Loan-Export-001.xml", 86000, "data"))},
    "steps": [
        {"type": "fields", "title": "About Your Product", "intro": "We filled in what your application already told us. Check it, add anything missing, and confirm.",
         "sections": sections(PR["APP"], ["Your Organization", "Company Contact", "Authorized Signer", "Products to Be Reviewed", "Scale and Timing"])},
        {"type": "booking", "id": "pre", "title": "Book the Pre-Assessment Call", "offset": 4, "length": "60 minutes", "from": "Your Assessor",
         "intro": "A call with your assessor before anything is reviewed: what the product does, which MISMO messages it uses, and what to send.",
         "confirm": "Your assessor and certifications@mismo.org are told, and a calendar invitation follows from the assessor.",
         "prep": ["Bring someone who knows the data mapping.", "Be ready to say which MISMO version and which messages the product produces or reads."]},
        {"type": "docs", "title": "Specification and Data", "intro": "The files the assessor reviews before your demonstration.",
         "areas": [{"code": "spec", "name": "Specification or Mapping", "help": "How your product's data maps to MISMO."},
                   {"code": "data", "name": "Sample Data Files", "help": "MISMO XML your product produced, with no real borrower data."},
                   {"code": "iface", "name": "Interface Documentation", "help": "How the interface is called and what it returns.", "optional": True},
                   {"code": "demo", "name": "Demo Artifacts", "help": "Add them after your demonstration.", "optional": True}]},
        {"type": "booking", "id": "demo", "title": "Book Your Demonstration", "offset": 15, "length": "90 minutes", "from": "Your Assessor",
         "intro": "Pick one of the times your assessor has offered. You will show the product producing and reading MISMO data.",
         "confirm": "Your assessor and certifications@mismo.org are told, and a calendar invitation follows from the assessor.",
         "prep": ["Have a test environment with sample loans (no real borrower data).", "Be ready to produce a message live and validate it against the MISMO schema."]},
        {"type": "review", "title": "Review and Submit"}]}

# ---------- Certified Consultant ----------
cv = org_values("Ridgeview Mortgage Advisors, LLC", "410 Market Street, Floor 9", "Philadelphia", "PA", "19106", 11, "Chris Nguyen", "Managing Partner",
                "chris.nguyen@ridgeview.example", "215-555-0129", "Chris Nguyen", "Managing Partner", "chris.nguyen@ridgeview.example", "https://ridgeview.example",
                {"employees": 24, "aboutUs": "Ridgeview helps lenders and servicers plan and deliver technology change: LOS and servicing system selection, data quality programs and eMortgage adoption, with MISMO standards at the center of the work."})
cons_secs = sections(CO["APP"], ["Key Employee Bios"])
proj_secs = sections(CO["APP"], ["Project Examples"])
cfgs["consultant"] = {
    "key": "consultant", "programName": "Certified Consultant", "kicker": "MISMO Certified Consultant · Initial · Sample",
    "heroSub": "Five steps. Check your firm's details, confirm your key people and project examples, add the write-ups and references, then send it to MISMO.",
    "meta": [["Firm", cv["org"]], ["Employees", "24"], ["Projects", "2"]],
    "journey": [["Applied", "Website form"], ["Agreement and Fee", "DocuSign and invoice"], ["Your Submission", "People, projects, references"], ["MISMO Review", "Checked by MISMO"], ["Results", "MISMO decides"], ["Certified", "Mark License"]],
    "now": 2, "code": "615204",
    "inviteWhen": "Once the agreement is signed and the invoice is paid, MISMO opens the firm's portal and this invitation goes to the primary contact.",
    "inviteStep": "Agreement signed, invoice paid.",
    "inviteBody": "Thank you, your payment has been received. Your certification portal is ready. It's where you confirm your key people and project examples and add the write-ups and client references.",
    "inviteRows": [["Firm", cv["org"]], ["Certification", "Certified Consultant, initial"], ["From Your Application", "3 people, 2 projects"]],
    "attestation": EM_ATTEST,
    "after": ["MISMO checks your submission is complete.", "MISMO reviews your people, projects and references, and may call a reference.",
              "Anything we need more on comes back to you here.", "MISMO decides, and once you pass, the Mark License Agreement goes to you by DocuSign."],
    "sample": {"org": cv["org"], "subject": cv["org"].replace(", LLC", ""), "contactName": cv["contact"], "contactEmail": cv["contactEmail"], "signerName": cv["signer"], "values": cv,
               "reps": {"bios": [{"name": "Chris Nguyen", "title": "Managing Partner", "credentials": "CMSP", "bio": "Twenty years in mortgage technology, leading LOS and data programs for lenders and servicers."},
                                 {"name": "Dana Whitfield", "title": "Principal, Data Practice", "credentials": "AMSP", "bio": "Leads data quality and MISMO mapping engagements; former secondary marketing analyst."},
                                 {"name": "Lee Okafor", "title": "Senior Consultant", "credentials": "", "bio": ""}],
                        "projectExamples": [{"client": "Regional bank (name on request)", "segment": "Origination", "engagement": "Technology Implementation", "market": "Residential",
                                             "scope": "Replaced the bank's loan origination system and rebuilt its investor data delivery on MISMO 3.6.", "deliverables": "Requirements, data mapping, test plan and cutover plan.", "usesMismo": "Yes", "mismoDescription": "MISMO 3.6 Reference Model", "writeUp": "Project-1-LOS-Replacement.pdf"},
                                            {"client": "Mid-size servicer (name on request)", "segment": "Servicing", "engagement": "Operational Efficiency Planning", "market": "Residential",
                                             "scope": "", "deliverables": "", "usesMismo": "", "mismoDescription": "", "writeUp": ""}]},
               "answers": {}, "docs": docs(("Project-1-LOS-Replacement.pdf", 760000, "writeups"))},
    "steps": [
        {"type": "fields", "title": "About Your Firm", "intro": "We filled in what your application already told us. Check it, add anything missing, and confirm.",
         "sections": sections(CO["APP"], ["Your Organization", "Primary Contact Information", "Authorized Signer", "About Us"])},
        {"type": "fields", "title": "Key Employee Bios", "intro": "Everyone who will deliver work under the certification. At least one must hold an AMSP or CMSP credential.", "sections": cons_secs},
        {"type": "fields", "title": "Project Examples", "intro": "One entry per engagement you want counted. Attach each write-up on the next step.", "sections": proj_secs},
        {"type": "docs", "title": "Write-Ups and References", "intro": "The write-up for each project example, and your client references.",
         "areas": [{"code": "writeups", "name": "Project Write-Ups", "help": "One per project example, named as on the project."},
                   {"code": "refs", "name": "Client References", "help": "Reference letters, or a list of contacts MISMO may call."},
                   {"code": "creds", "name": "Credentials", "help": "AMSP or CMSP certificates, if you have copies.", "optional": True}]},
        {"type": "review", "title": "Review and Submit"}]}

# ---------- FRAME ----------
fq = questionnaire(FR["FORMS"], "Q")
fq_secs = fold_reading([s for s in fq["sections"] if not s["heading"].startswith(("11.", "13."))])
_frame_src = open(os.path.join(ROOT, "forms", "frame", "index.html"), encoding="utf-8").read()
_i = _frame_src.find('"expected": [', _frame_src.find('Supporting Documentation", "help"'))
expected, _ = json.JSONDecoder().raw_decode(_frame_src[_i + len('"expected": '):]) if _i > 0 else ([], 0)
fv = org_values("Summit Lane Advisory Group, LLC", "1200 Peachtree Street NE", "Atlanta", "GA", "30309", 8, "Riley Chen", "Partner, AI Governance",
                "riley.chen@summitlane.example", "404-555-0156", "Avery Johnson", "Managing Director", "avery.johnson@summitlane.example", "https://summitlane.example",
                {"size": "11 or more"})
cfgs["frame"] = {
    "key": "frame", "programName": "FRAME Certified Advisory Partner", "kicker": "MISMO FRAME Certified Advisory Partner · Initial · Sample",
    "heroSub": "Five steps. Check your firm's details, answer the FRAME questionnaire, add your supporting documents, complete the practical exercise, then send it to MISMO.",
    "meta": [["Firm", fv["org"]], ["Employees", "11 or more"], ["Questionnaire", "12 sections"]],
    "journey": [["Applied", "Website form"], ["Agreement and Fee", "DocuSign and invoice"], ["Your Submission", "Questionnaire and documents"], ["Practical Exercise", "Brief and scenario"],
                ["MISMO Review", "Scored by MISMO"], ["Results", "MISMO decides"], ["Certified", "Mark License"]],
    "now": 2, "code": "615204",
    "inviteWhen": "Once the agreement is signed and the fee is paid, MISMO opens the firm's portal and this invitation goes to the primary contact.",
    "inviteStep": "Agreement signed, fee paid.",
    "inviteBody": "Thank you, your payment has been received. Your certification portal is ready. It's where you complete the FRAME questionnaire, add your supporting documents and return your practical exercise.",
    "inviteRows": [["Firm", fv["org"]], ["Certification", "FRAME Certified Advisory Partner"], ["Questionnaire", "12 sections, saves as you go"]],
    "attestation": "I certify that the information provided in this questionnaire is accurate and complete to the best of my knowledge and that the organization agrees to comply with the requirements of the MISMO FRAME Certified Advisory Partner Program.",
    "after": ["MISMO checks your submission is complete.", "MISMO scores your questionnaire and practical exercise, and may ask for an interview or more documents.",
              "Anything we need more on comes back to you here.", "MISMO decides, and once you pass, the Mark License Agreement goes to you by DocuSign."],
    "sample": {"org": fv["org"], "subject": "Summit Lane Advisory", "contactName": fv["contact"], "contactEmail": fv["contactEmail"], "signerName": fv["signer"], "values": fv, "reps": {},
               "answers": {"0-1": fv["org"], "0-2": "Summit Lane Advisory", "0-3": "Riley Chen, Partner, AI Governance, riley.chen@summitlane.example, 404-555-0156",
                           "0-4": "https://summitlane.example", "0-5": "2018", "0-6": "46",
                           "0-7": "Risk, compliance and technology advisory for lenders, servicers and mortgage technology companies.",
                           "0-8": "Our AI governance practice helps clients inventory their AI use, set policy and oversight, assess model and vendor risk, and prepare for examinations.",
                           "1-10": "Most of our clients are mortgage lenders and servicers; our partners came from lending operations, secondary marketing and regulatory compliance.",
                           "1-11": []},
               "docs": docs(("Summit-Lane-Capabilities-Statement.pdf", 1320000, "exp0"), ("FRAME-Practitioner-Bios.pdf", 640000, "exp1"))},
    "steps": [
        {"type": "fields", "title": "About Your Firm", "intro": "We filled in what your application already told us. Check it, add anything missing, and confirm.",
         "sections": sections(FR["APP"], ["Your Organization", "Primary Contact", "Authorized Signer"])},
        {"type": "questionnaire", "title": "FRAME Questionnaire", "intro": "The FRAME Advisory Partner questionnaire, section by section. Where an answer says “See Attachment”, add the file on the next step.", "form": {"label": "FRAME Questionnaire", "sections": fq_secs}},
        {"type": "docs", "title": "Supporting Documents", "intro": "Attach what your answers rely on. Redact client-identifying or confidential information first.",
         "areas": [{"code": "exp%d" % i, "name": e, "optional": i > 1} for i, e in enumerate(expected)]},
        {"type": "exercise", "title": "Practical Exercise", "intro": "Every FRAME applicant gets the same brief and one product scenario. Return your advisory write-up here.",
         "brief": ["Act as the advisor to the lender described in your scenario. Using MISMO FRAME, set out how you would assess and govern the AI use it describes.",
                   "Say what you would ask for, the risks you see, the controls you would recommend and how you would report to the client's leadership.",
                   "Keep it to what you would actually deliver to a client. MISMO scores it with the questionnaire."],
         "scenario": {"title": "Sample scenario: an AI income-calculation assistant",
                      "body": ["A mid-size lender is rolling out a vendor tool that reads borrower pay stubs and tax returns and proposes qualifying income for underwriters to accept or change.",
                               "Underwriters accept the proposal on about 80% of loans. The vendor updates its model every quarter. The lender has no AI policy yet.",
                               "This is a made-up example for the sample portal; real scenarios are assigned by MISMO."]}},
        {"type": "review", "title": "Review and Submit"}]}


def page(slug, cfg):
    title = cfg["programName"] + " Portal"
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'">
<!-- Sample portal, built by portal/engine/build.py from the live forms. A made-up company; nothing is sent or uploaded. -->
<title>%(title)s · Sample</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../engine/portal.css">
<style>[hidden]{display:none!important}body{margin:0}</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>%(logo)s</defs></svg>
<header class="mast"><div class="wrap">
  <div class="logoplate"><svg class="wordmark" role="img" aria-label="MISMO" viewBox="0 0 708 108"><use href="#mismo-logo"/></svg></div>
  <div class="vr"></div>
  <div class="pname">%(name)s</div>
  <div class="right"><span class="eyebrow">Programs &amp; Operations</span><button class="theme-btn" id="theme-btn" type="button">Dark</button></div>
</div></header>
<div class="band"><div class="wrap">
  <div class="draftnote"><b>Sample</b><span>A made-up company, to show how the portal works. Nothing is sent or uploaded.</span></div>
  <span style="margin-left:auto"></span>
  <button type="button" id="reset" class="btn ghost sm">Restore the Sample</button>
  <button type="button" id="seesign" class="btn ghost sm">See Sign-In</button>
</div></div>
<section class="wrap gate" id="gate" hidden></section>
<section class="hero" id="hero"></section>
<div class="wrap"><nav class="steps" id="steps" aria-label="Steps"></nav></div>
<main class="wrap" id="main" style="padding-block:18px 60px"></main>
<div class="toast" id="toast" role="status" hidden></div>
<script id="cfg" type="application/json">%(cfg)s</script>
<script src="../engine/portal.js"></script>
</body>
</html>
""" % {"title": title, "name": cfg["programName"], "logo": LOGO, "cfg": json.dumps(cfg, ensure_ascii=False).replace("</", "<\\/")}


for slug, cfg in cfgs.items():
    d = os.path.join(ROOT, "portal", slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page(slug, cfg))
    print("built portal/%s/index.html" % slug)
