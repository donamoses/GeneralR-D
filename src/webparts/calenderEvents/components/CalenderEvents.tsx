import * as React from 'react';
import styles from './CalenderEvents.module.scss';
import type { ICalenderEventsProps, ICalenderEventsState } from './ICalenderEventsProps';
import { BaseService } from '../../../shared/services/BaseService';

export default class CalenderEvents extends React.Component<ICalenderEventsProps, ICalenderEventsState, {}> {
  private service: BaseService;/* To call the service file */
  constructor(props: ICalenderEventsProps) {
    super(props);
    this.state = {
      currentUser: {
        id: "",
        email: "",
        title: ""
      }
    }
    const siteURL = window.location.protocol + "//" + window.location.hostname + this.props.context.pageContext.web.serverRelativeUrl;
    this.service = new BaseService(this.props.context, siteURL);
  }
  public async componentDidMount() {
    const user = await this.service.getCurrentUser();
    if (user) {
      this.setState({
        currentUser: {
          id: user.Id,
          email: user.Email,
          title: user.Title
        }
      });
    }
  }
  public render(): React.ReactElement<ICalenderEventsProps> {


    return (
      <section className={`${styles.calenderEvents}`}>
        <div className={styles.heading}>
          <h1 className={styles.pagetitle}>{this.props.WebpartTitle}</h1>
        </div>
        <div>{this.state.currentUser.title}</div>
      </section>
    );
  }
}
