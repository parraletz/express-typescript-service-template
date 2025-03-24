// eslint-disable-file @typescript-eslint/no-unused-vars
// eslint-disable-file @typescript-eslint/no-empty-object-type

import { Application } from 'express' // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  namespace Express {
    interface Application extends Application {} // eslint-disable-line @typescript-eslint/no-empty-object-type
  }
}
