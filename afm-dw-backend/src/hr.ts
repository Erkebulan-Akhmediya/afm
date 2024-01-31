
import dotenv from 'dotenv';
dotenv.config();

import {init}  from './loaders/web-server';


(async () => {
  init();
})();
