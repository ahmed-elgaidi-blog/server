import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { CreateSessionDto, GetSessionDto, GetSessionQuery } from '../dtos'
import { MESSAGES as AUTH_MESSAGES } from '../../auth/constants'
import { UserService } from '../../user/services'
import { SessionRepository } from '../repositories'
import { ResultMessage } from '@src/shared/types'
import { TokenUtil } from '@src/shared/utils'
import { MESSAGES } from '../constants'
import { Session } from '../schemas'

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userService: UserService,
  ) {}

  public async createSession(data: CreateSessionDto): Promise<Session> {
    return await this.sessionRepo.createOne(data)
  }

  public async regenerateSession(refreshToken: string): Promise<Session> {
    const { _id: sessionId, device, ipAddress } = await this.getSession({ refreshToken })

    await this.revokeSession(sessionId)

    const { _id } = await this.userService.findRootUser()

    const payload = {
      device,
      ipAddress,
      accessToken: await TokenUtil.generateAccessToken({ _id }),
      refreshToken: await TokenUtil.generateRefreshToken({ _id }),
    }

    return await this.sessionRepo.createOne(payload)
  }

  public async revokeSession(sessionId: string): Promise<ResultMessage> {
    const isSessionRevoked = await this.sessionRepo.deleteOne(sessionId)

    if (isSessionRevoked.deletedCount === 0) throw new InternalServerErrorException(MESSAGES.DELETE_FAILED)

    return { message: MESSAGES.REVOKED_SUCCESSFULLY }
  }

  public async deleteSession(sessionId: string): Promise<ResultMessage> {
    const isSessionDeleted = await this.sessionRepo.deleteOne(sessionId)

    if (isSessionDeleted.deletedCount === 0) throw new InternalServerErrorException(MESSAGES.DELETE_FAILED)

    return { message: AUTH_MESSAGES.LOGGED_OUT_SUCCESSFULLY }
  }

  public async revokeAllSessions(excludedAccessToken: string): Promise<ResultMessage> {
    return await this.sessionRepo.deleteMany(excludedAccessToken)
  }

  public async getSession({ sessionId, accessToken, refreshToken }: GetSessionDto): Promise<Session> {
    const query: GetSessionQuery = {}

    if (sessionId) query.sessionId = sessionId
    if (accessToken) query.accessToken = accessToken
    if (refreshToken) query.refreshToken = refreshToken

    const isSessionFound = await this.sessionRepo.findOne(query)

    if (!isSessionFound) throw new UnauthorizedException(AUTH_MESSAGES.INVOKED_TOKEN)

    return isSessionFound
  }

  public async getAllSessions(): Promise<Session[]> {
    return await this.sessionRepo.findMany()
  }
}
