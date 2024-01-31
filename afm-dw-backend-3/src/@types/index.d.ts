import { Details } from "express-useragent";


declare global {
   namespace Express {
      export interface Request {
         userinfo?: any,
         useragent?: Details,
         lang?: any,
         lang_id?: any,
         decoded?: any
      }
   }
 }
