import { BaseService } from "../../../shared/services/BaseService";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../shared/PnP/pnpjsConfig";

export class SubmissionService extends BaseService {
  private spfi: SPFI;
  constructor(context: WebPartContext, siteUrl: string) {
    super(context, siteUrl);
    this.spfi = getSP(context);
  }

  public getDashboardData(queryurl: string, select: string): Promise<any> {
    return this.spfi.web.getList(queryurl).items
      .select(select)()
  }

  public async getUsersInTopManagementGroup(): Promise<any[]> {
    try {
      const groupUsers = await this.spfi.web.siteGroups.getByName("TOP MANAGEMENT").users();
      return groupUsers || [];
    } catch (error) {
      console.error("Error fetching TOP MANAGEMENT users:", error);
      return [];
    }
  }

}