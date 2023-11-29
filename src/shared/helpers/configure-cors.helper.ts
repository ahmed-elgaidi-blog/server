import { INestApplication } from '@nestjs/common'
import { EnvironmentType } from '../enums'
import { appConfig } from '../config'

export const configureCors = (app: INestApplication): void => {
  appConfig.environment.env === EnvironmentType.DEVELOPMENT || appConfig.environment.env === EnvironmentType.TEST
    ? app.enableCors()
    : app.enableCors({
        origin: appConfig.allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        maxAge: 86400,
        credentials: true,
      })
}
