import * as React from 'react';
import styles from './SuggestionBox.module.scss';
import type { ISuggestionBoxProps, ISuggestionBoxState } from './ISuggestionBoxProps';
import { IconButton, MessageBar, Modal, Pivot, PivotItem, PrimaryButton, TextField, TooltipHost } from '@fluentui/react';
import { Pagination } from '@pnp/spfx-controls-react';
import { SubmissionService } from '../services/SubmissionService';
import * as strings from 'SuggestionBoxWebPartStrings';
export default class SuggestionBox extends React.Component<ISuggestionBoxProps, ISuggestionBoxState, {}> {
  private service: SubmissionService;
  constructor(props: ISuggestionBoxProps) {
    super(props);

    this.state = {
      isAdmin: false,
      selectedTabKey: "Suggestions",
      gridColumns: [],
      gridItems: [],
      currentPage: 1,
      itemsPerPage: 5,
      isAddOpen: false,
      title: "",
      suggestionDetails: "",
      isApproveOpen: false,
      isRejectOpen: false,
      selectedSuggestionId: null,
      comments: ""

    }
    this.service = new SubmissionService(this.props.context, this.props.context.pageContext.web.serverRelativeUrl);
    this.onTabChange = this.onTabChange.bind(this);
    this.createMySuggestion = this.createMySuggestion.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.checkAdminPermission = this.checkAdminPermission.bind(this);
    this.loadSuggestions = this.loadSuggestions.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onChangeSuggestionDetails = this.onChangeSuggestionDetails.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onAddClose = this.onAddClose.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
    this.onApprove = this.onApprove.bind(this);
    this.onApproveClose = this.onApproveClose.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.onReject = this.onReject.bind(this);
    this.onRejectClose = this.onRejectClose.bind(this);
    this.onChangeRemarkComments = this.onChangeRemarkComments.bind(this);

  }
  public async componentDidMount() {
    await this.checkAdminPermission();
  }
  async componentDidUpdate(): Promise<void> {
    if (this.state.selectedTabKey) {
      await this.loadSuggestions();
    }
  }
  private checkAdminPermission = async () => {
    const userEmail = this.props.context.pageContext.legacyPageContext.userEmail?.toLowerCase();
    console.log("Current User Email:", userEmail);
    const userGroups: any[] = await this.service.getCurrentUserGroups();
    console.log("User Groups:", userGroups);
    let isAdmin = false;
    const userGroupNames = userGroups?.map((g: any) => g?.Title?.trim().toLowerCase()) || [];
    console.log("User Group Names:", userGroupNames);
    if (userGroupNames.includes("Admin".toLowerCase())) {
      isAdmin = true;
    }
    this.setState({ isAdmin });
    await this.loadSuggestions();
  }
  private loadSuggestions = async () => {
    let requestmasterfilter = "";
    switch (this.state.selectedTabKey) {
      case "Suggestions":
        requestmasterfilter = `Status eq 'Approved'`;
        break;
      case "MySuggestion":
        requestmasterfilter = `SubmittedBy/EMail eq '${this.props.context.pageContext.legacyPageContext.userEmail}'`;
        break;
      case "PendingSuggestions":
        requestmasterfilter = `Status eq 'New' or Status eq 'Under Review'`;
        break;
      case "Rejected":
        requestmasterfilter = `Status eq 'Rejected'`;
        break;
      default:
        requestmasterfilter = "";
    }
    // Implement your logic to load suggestions based on the selected tab
    console.log("Loading suggestions for tab:", this.state.selectedTabKey);
    //Get request master list data
    const rqqueryurl = `${this.props.context.pageContext.web.serverRelativeUrl}${strings.queryList}${this.props.suggestionBoxList}`;
    const rqselect = '*,SubmittedBy/Title,SubmittedBy/EMail';
    const rqexpand = 'SubmittedBy';
    // Fetch items with select, expand, and filter
    const rqmasterresponse = await this.service.getPagedItemsSelectExpandFilter(rqqueryurl, rqselect, rqexpand, requestmasterfilter);
    console.log("Fetched Items:", rqmasterresponse);
    this.setState({ gridItems: rqmasterresponse });
  }
  private onTabChange = (item?: PivotItem) => {
    if (item) {
      this.setState({ selectedTabKey: item.props.itemKey || "", gridItems: [], currentPage: 1 });
    }
  };
  private createMySuggestion = () => {
    // Implement your logic to create a new suggestion
    console.log("Create My Suggestion button clicked");
    this.setState({ isAddOpen: true });
  };
  public handlePageChange = (pageNumber: number) => {
    this.setState({ currentPage: pageNumber });
  };


  //Title Change
  public onTitleChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, title: string) {
    this.setState({ title: title });
  }
  //Brief of Subject Change
  public onChangeSuggestionDetails(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, suggestionDetails: string) {
    this.setState({ suggestionDetails: suggestionDetails });
  }
  public onSubmit = async () => {
    // Implement your logic to submit the new suggestion
    console.log("Submitting new suggestion with Title:", this.state.title, "and Details:", this.state.suggestionDetails);
    // await this.service.createNewItem(this.state.title, this.state.suggestionDetails);
    const suggestionListurl = this.props.context.pageContext.web.serverRelativeUrl + strings.queryList + this.props.suggestionBoxList;
    const newItem = {
      Title: this.state.title,
      SuggestionDetails: this.state.suggestionDetails,
      Status: "New",
      SubmittedById: this.props.context.pageContext.legacyPageContext.userId,
      SubmissionDate: new Date().toISOString()

    }
    const additem = await this.service.createNewItem(suggestionListurl, newItem);
    if (additem) {
      alert("Suggestion submitted successfully.");
      this.setState({ isAddOpen: false, title: "", suggestionDetails: "" });
      await this.loadSuggestions();
    }

  }
  private onAddClose = () => {
    this.setState({ isAddOpen: false, title: "", suggestionDetails: "" });
  }
  private handleApprove = async (itemId: number) => {
    // Implement your logic to approve the suggestion
    console.log("Approve button clicked for item ID:", itemId);
    this.setState({ selectedSuggestionId: itemId, isApproveOpen: true });
  }
  public onApprove = async () => {
    // Implement your logic to approve the suggestion
    console.log("Approving suggestion with ID:", this.state.selectedSuggestionId, "and Comments:", this.state.comments);
    const suggestionListurl = this.props.context.pageContext.web.serverRelativeUrl + strings.queryList + this.props.suggestionBoxList;
    const updateItem = {
      Status: "Approved",
      AdminComments: this.state.comments
    }
    const approveupdated = await this.service.updateItem(suggestionListurl, updateItem, Number(this.state.selectedSuggestionId));
    if (approveupdated) {

      this.setState({ isApproveOpen: false, selectedSuggestionId: null, comments: "" });
      alert("Suggestion approved successfully.");
      await this.loadSuggestions();
    }
  }
  private onApproveClose = () => {
    this.setState({ isApproveOpen: false, selectedSuggestionId: null, comments: "" });
  }
  private handleReject = async (itemId: number) => {
    // Implement your logic to reject the suggestion
    console.log("Reject button clicked for item ID:", itemId);
    this.setState({ selectedSuggestionId: itemId, isRejectOpen: true });
  }
  public onReject = async () => {
    // Implement your logic to reject the suggestion
    console.log("Rejecting suggestion with ID:", this.state.selectedSuggestionId, "and Comments:", this.state.comments);
    const suggestionListurl = this.props.context.pageContext.web.serverRelativeUrl + strings.queryList + this.props.suggestionBoxList;
    const updateItem = {
      Status: "Rejected",
      AdminComments: this.state.comments
    }
    const rejectupdated = await this.service.updateItem(suggestionListurl, updateItem, Number(this.state.selectedSuggestionId));
    if (rejectupdated) {
      this.setState({ isRejectOpen: false, selectedSuggestionId: null, comments: "" });
      alert("Suggestion rejected successfully.");
      await this.loadSuggestions();
    }
  }
  private onRejectClose = () => {
    this.setState({ isRejectOpen: false, selectedSuggestionId: null, comments: "" });
  }
  public onChangeRemarkComments(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, comments: string) {
    this.setState({ comments: comments });
  }
  public render(): React.ReactElement<ISuggestionBoxProps> {
    const indexOfLastItem = this.state.currentPage * this.state.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.state.itemsPerPage;
    const currentItems = this.state.gridItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(this.state.gridItems.length / this.state.itemsPerPage);

    return (
      <section className={styles.container}>
        <div className={styles.formpopup}>
          <div className={styles.formheader}>
            <div className={styles.formtitle}>{this.props.header}</div>
          </div>
          <div className={styles.formbody}>
            <div className={styles.pivotwrapper}>
              <Pivot
                aria-label="Data Pivot"
                selectedKey={this.state.selectedTabKey}
                headersOnly={true}
                onLinkClick={this.onTabChange}
                overflowBehavior={'menu'}
                overflowAriaLabel="more items"
              >
                <PivotItem headerText="Suggestions" itemKey="Suggestions" itemIcon="AllApps" />
                <PivotItem headerText="My Suggestions" itemKey="MySuggestion" itemIcon="EditContact" />
                {(this.state.isAdmin) && <PivotItem headerText="Pending Suggestions" itemKey="PendingSuggestions" itemIcon='PenWorkspace' />}
                {(this.state.isAdmin) && <PivotItem headerText="Rejected" itemKey="Rejected" itemIcon="Cancel" />}

              </Pivot>
              {/* Conditionally render the export button */}
              {this.state.selectedTabKey === "MySuggestion" && (
                <div style={{ marginBottom: "10px", textAlign: "right" }}>
                  <TooltipHost content="Create My Suggestion">
                    <IconButton
                      iconProps={{ iconName: "Add" }}
                      title="Create My Suggestion"
                      ariaLabel="Create My Suggestion"
                      onClick={this.createMySuggestion}
                    />
                  </TooltipHost>
                </div>
              )}
              {currentItems.length > 0 && <>
                <div>
                  {currentItems.map((item: any) => (
                    <div key={item.Id} className={styles.suggestionBox}>
                      <div className={styles.header}>{item.Title}</div>
                      <div className={styles.description}>{item.SuggestionDetails}</div>
                      <div className={styles.footer}>
                        <span className={styles.submittedBy}>Submitted by: {item.SubmittedBy?.Title}</span>
                        <span className={styles.createdDate}>{item.Status}</span>
                      </div>
                      {/* Conditionally render Approve and Reject buttons for PendingSuggestions */}
                      {this.state.selectedTabKey === "PendingSuggestions" && (
                        <div className={styles.actionButtons}>
                          <IconButton
                            iconProps={{ iconName: "CheckMark" }}
                            title="Approve"
                            ariaLabel="Approve"
                            className={styles.approveButton}
                            onClick={() => this.handleApprove(item.Id)}
                          />
                          <IconButton
                            iconProps={{ iconName: "Cancel" }}
                            title="Reject"
                            ariaLabel="Reject"
                            className={styles.rejectButton}
                            onClick={() => this.handleReject(item.Id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Pagination
                  totalPages={totalPages}
                  currentPage={this.state.currentPage}
                  onChange={this.handlePageChange}
                  limiter={2}
                /></>
              }
              {currentItems.length <= 0 && <p>
                <MessageBar>{"No records found."}</MessageBar>
              </p>}
            </div>
            <div>
              <Modal
                isOpen={this.state.isAddOpen}
                onDismiss={() => this.setState({ isAddOpen: false })}
                isBlocking={false}
                className={styles.largeModal} // Add a custom class here
              >
                <div style={{ padding: '1em', maxWidth: '500px' }}>
                  <h3>{"Add New Suggestion"}</h3>
                  <TextField label="Title" value={this.state.title} onChange={this.onTitleChange} required maxLength={250} />
                  <TextField label="Suggestion Details" multiline rows={3} autoAdjustHeight value={this.state.suggestionDetails} onChange={this.onChangeSuggestionDetails} required />
                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    {this.state.title.replace(/\s/g, '').length > 0 && this.state.suggestionDetails.replace(/\s/g, '').length > 0 && (
                      <PrimaryButton className={styles.btn} onClick={() => this.onSubmit()}> Submit </PrimaryButton>)}
                    <PrimaryButton className={styles.btn} onClick={this.onAddClose} >Cancel</PrimaryButton >
                  </div>
                </div>
              </Modal>
            </div>
            <div>
              <Modal
                isOpen={this.state.isRejectOpen}
                onDismiss={() => this.setState({ isRejectOpen: false })}
                isBlocking={false}
                className={styles.largeModal} // Add a custom class here
              >
                <div style={{ padding: '1em', maxWidth: '500px' }}>
                  <h3>{"Rejected"}</h3>
                  <TextField label="Remark Comments" multiline rows={3} autoAdjustHeight value={this.state.comments} onChange={this.onChangeRemarkComments} required />
                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    {this.state.comments.replace(/\s/g, '').length > 0 && (
                      <PrimaryButton className={styles.btn} onClick={() => this.onReject()}> Reject </PrimaryButton>)}
                    <PrimaryButton className={styles.btn} onClick={this.onRejectClose} >Cancel</PrimaryButton >
                  </div>
                </div>
              </Modal>
            </div>
            <div>
              <Modal
                isOpen={this.state.isApproveOpen}
                onDismiss={() => this.setState({ isApproveOpen: false })}
                isBlocking={false}
                className={styles.largeModal} // Add a custom class here
              >
                <div style={{ padding: '1em', maxWidth: '500px' }}>
                  <h3>{"Approve"}</h3>
                  <TextField label="Remark Comments" multiline rows={3} autoAdjustHeight value={this.state.comments} onChange={this.onChangeRemarkComments} required />
                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    {this.state.comments.replace(/\s/g, '').length > 0 && (
                      <PrimaryButton className={styles.btn} onClick={() => this.onApprove()}> Approve </PrimaryButton>)}
                    <PrimaryButton className={styles.btn} onClick={this.onApproveClose} >Cancel</PrimaryButton >
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
