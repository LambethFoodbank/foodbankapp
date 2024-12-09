export type FileGenerationDataFetchResponse<Data, ErrorType extends string> =
    | {
          data: { fileData: Data; fileName: string };
          error: null;
      }
    | { data: null; error: { type: ErrorType; logId: string } };
