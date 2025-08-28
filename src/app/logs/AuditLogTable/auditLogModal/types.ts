export type AuditLogModalRowResponse<Data> =
    | {
          data: Data;
          errorMessage: null;
      }
    | {
          data: null;
          errorMessage: string;
      };
