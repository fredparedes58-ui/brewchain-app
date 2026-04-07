// Tipos del schema oficial TRACES NT EUDR API
export interface TracesNTSubmission {
  operatorType: 'OPERATOR' | 'TRADER';
  activityType: 'IMPORT' | 'EXPORT' | 'DOMESTIC';
  internalReferenceNumber: string;
  countryOfOrigin: string;
  comments?: string;
  commodities: TracesNTCommodity[];
}

export interface TracesNTCommodity {
  hsHeading: string;       // ej: '0901'
  description: string;
  netWeight: number;       // kg
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface TracesNTResponse {
  referenceNumber: string; // TRA.NT.YYYY.XXXXXXX
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submissionTimestamp: string;
  estimatedReviewDate?: string;
}
