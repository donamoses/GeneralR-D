import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ICalenderEventsProps {
  context: WebPartContext
  WebpartTitle: string;
}

export interface ICalenderEventsState {
  currentUser: IUser;
  eventData: any[];
}
export interface IUser {
  id: any;
  email: string;
  title: string;
}