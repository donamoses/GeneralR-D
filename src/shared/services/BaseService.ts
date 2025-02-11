import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI } from "@pnp/sp/presets/all";
import { getSP } from "../PnP/pnpjsConfig";

export class BaseService {
    private sp: SPFI;
    constructor(context: WebPartContext, siteUrl: string) {
        this.sp = getSP(context);
    }
    public getCurrentUser() {
        return this.sp.web.currentUser();
    }
    public getListItems(url: string): Promise<any> {
        return this.sp.web.getList(url).items();
    }
    public addListItem(url: string, data: any): Promise<any> {
        return this.sp.web.getList(url).items.add(data);
    }
    public updateItem(url: string, data: any, id: number): Promise<any> {
        return this.sp.web.getList(url).items.getById(id).update(data);
    }

}