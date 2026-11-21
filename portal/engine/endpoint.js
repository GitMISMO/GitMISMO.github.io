/* Where the company portals send their work (21 Nov 2026). Set in the browser after the flows were imported,
   so the addresses never pass through anything else. Empty = the live portal says it opens shortly.
   MISMO_PORTAL_FLOW  = the "MISMO Company Portal - Serve" flow (HTTP trigger)
   MISMO_BOOKING_FLOW = the "MISMO Demo Booking - Serve" flow (the same address forms/schedule/ uses) */
window.MISMO_PORTAL_FLOW = "https://default867e5d11bde4499fb45e61572f9f33.7c.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/5048693bd0cb4fc394a62b7ec4875e26/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oCDXUXoEpX1145a5Io73l1MezZ8gqnaLf0fQl7UvPzo";
window.MISMO_BOOKING_FLOW = "https://default867e5d11bde4499fb45e61572f9f33.7c.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/eb09924f6eb54c2d95c701a23d13c506/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=78PNgHmVC11lygLImiojG7gUqqy2C3yLuw_WcVe1VwI";
