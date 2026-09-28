export interface CreateSearchMatrixDTO {
  businessCategoryId: string;

  businessCategory: string;

  locationId: string;

  location: string;

  provider: string;

  query: string;
}

export type UpdateSearchMatrixDTO = Partial<CreateSearchMatrixDTO> & {
  enabled?: boolean;
};
