import * as React from 'react';
import styles from './CalenderEvents.module.scss';
import type { ICalenderEventsProps, ICalenderEventsState } from './ICalenderEventsProps';
import * as moment from 'moment';
import { CalenderEventsService } from '../services/CalenderEventsService';

export default class CalenderEvents extends React.Component<ICalenderEventsProps, ICalenderEventsState, {}> {
  private service: CalenderEventsService;/* To call the service file */
  constructor(props: ICalenderEventsProps) {
    super(props);
    this.state = {
      currentUser: {
        id: "",
        email: "",
        title: ""
      },
      eventData: []
    }
    const siteURL = window.location.protocol + "//" + window.location.hostname + this.props.context.pageContext.web.serverRelativeUrl;
    this.service = new CalenderEventsService(this.props.context, siteURL);
    this.getEvents = this.getEvents.bind(this);
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
    await this.getEvents()
  }
  public async getEvents() {
    const today = new Date();
    const firstday = moment(today.setMilliseconds(0)).format('YYYY-MM-DDT00:00:00.SSSSSSS');
    const nextDay = moment(today.setMilliseconds(0)).format('YYYY-MM-DDT23:59:59.SSSSSSS');
    const eventdata = await this.service.getCurrentdayEvents(this.props.context, firstday, nextDay);
    console.log(eventdata);
    this.setState({ eventData: eventdata })
  }
  public render(): React.ReactElement<ICalenderEventsProps> {


    return (
      <section className={`${styles.calenderEvents}`}>
        <div className={styles.heading}>
          <h1 className={styles.pagetitle}>{this.props.WebpartTitle}</h1>
        </div>
        <table >
          <tbody>
            <tr>
              <th>Subject</th>
              <th>Attendees</th>
              <th>Response</th>
            </tr>
            {this.state.eventData.map((event: any, eventIndex: any) => (
              event.attendees.map((attendee: any, attendeeIndex: any) => (
                <tr key={`${eventIndex}-${attendeeIndex}`}>
                  <td>{event.subject}</td>
                  <td>{attendee.emailAddress.name}</td>
                  <td>{attendee.status.response}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </section>
    );
  }
}
