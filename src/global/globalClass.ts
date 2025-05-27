export class ResponseData<D> {
    data: D | D[] | null;
    statusCode: number;
    message: string;
    success: boolean;
  
    constructor(data: D | D[] | null, statusCode: number, message: string) {
      this.data = data;
      this.statusCode = statusCode;
      this.message = message;
      this.success = statusCode >= 200 && statusCode < 300;
    }
  }
  