import { BaseService } from "../../../shared/services/BaseService";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../shared/PnP/pnpjsConfig";

export class CalenderEventsService extends BaseService {
  private spfi: SPFI;
  constructor(context: WebPartContext, siteUrl: string) {
    super(context, siteUrl);
    this.spfi = getSP(context);
  }
  public getCurrentUser() {
    return this.spfi.web.currentUser();
  }
  public async getCurrentdayEvents(context: any, start: string, end: string): Promise<any> {
    const filterQuery = `start/dateTime ge '${start}' and end/dateTime le '${end}'`; // Use the correct field name in your query
    const client = await context.msGraphClientFactory.getClient("3");
    const response = await client
      .api('me/events')
      .filter(filterQuery) // Apply the filter query here
      .select(['id', 'attendees', 'start', 'end', 'subject', 'recurrence', 'isOnlineMeeting', 'onlineMeetingUrl'])
      .orderby('start/dateTime')
      .version('v1.0')
      .get();
    let data = response.value;

    // Check if there's a next link for pagination
    let nextLink = response['@odata.nextLink'];
    // Fetch the next page of results if nextLink exists
    while (nextLink) {
      const nextResponse = await client.api(nextLink).get();
      data = data.concat(nextResponse.value); // Append new data to the existing data
      nextLink = nextResponse['@odata.nextLink']; // Update the nextLink for the next iteration
    }

    console.log(data.value);
    return data;
  }


}