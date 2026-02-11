import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ISuggestionBoxProps {
  header: string;
  context: WebPartContext;
  suggestionBoxList: string;
}
export interface ISuggestionBoxState {
  isAdmin: boolean;
  selectedTabKey: string;
  gridColumns: any[];
  gridItems: any[];
  currentPage: number;
  itemsPerPage: number;
  isAddOpen: boolean;
  title: string;
  suggestionDetails: string;
  isApproveOpen: boolean;
  isRejectOpen: boolean;
  selectedSuggestionId: any;
  comments: string;

}