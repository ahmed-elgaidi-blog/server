import { CreateKeywordDto } from '@src/modules/keyword/dtos'
import { CreateSeriesDto } from '@src/modules/series/dtos'
import { CreatePostDto } from '@src/modules/post/dtos'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateTagDto } from '@src/modules/tag/dtos'
import { INestApplication } from '@nestjs/common'
import { appConfig } from '@src/shared/config'
import { AppModule } from '@src/app.module'
import * as request from 'supertest'

describe('🏠 Keyword Module (E2E Tests)', () => {
  let app: INestApplication
  let loginPath: string = '/auth/login',
    createKeywordPath: string = '/admin/keywords',
    updateKeywordPath: string = '/admin/keywords',
    deleteKeywordPath: string = '/admin/keywords',
    getAllKeywordsCountPath: string = '/admin/keywords/count',
    getAllKeywordsPath: string = '/keywords',
    createPostPath: string = '/admin/posts',
    createSeriesPath: string = '/admin/series',
    createTagPath: string = '/admin/tags'

  let createKeywordMethod: string = 'POST',
    updateKeywordMethod: string = 'PATCH',
    deleteKeywordMethod: string = 'DELETE',
    getAllKeywordsCountMethod: string = 'GET',
    getAllKeywordsMethod: string = 'GET'

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    await app.init()
  })

  describe(`➡ "${createKeywordPath}" (${createKeywordMethod})`, () => {
    it(`Should be a private endpoint`, async () => {
      const { status } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .send({ name: 'test' } as CreateKeywordDto)

      expect(status).toBe(401)
    })

    it(`Should return 201 and created keyword`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      expect(status).toBe(201)
      expect(Object.keys(body).length).toBe(4)
    })

    it(`Should throw BadRequestException if the payload is not given`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the payload is empty`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is not of type string`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 1 })

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is too short`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '12' })

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is too long`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test'.repeat(100) })

      expect(status).toBe(400)
    })
  })

  describe(`➡ "${updateKeywordPath}" (${updateKeywordMethod})`, () => {
    it(`Should be a private endpoint`, async () => {
      const { status } = await request(app.getHttpServer())
        .patch(updateKeywordPath + '/1')
        .send({ name: 'test' } as CreateKeywordDto)

      expect(status).toBe(401)
    })

    it(`Should return 200 and updated keyword`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'updated' } as CreateKeywordDto)

      expect(status).toBe(200)
      expect(body.name).toBe('updated')
      expect(Object.keys(body).length).toBe(4)
    })

    it(`Should throw BadRequestException if the payload is not given`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the payload is empty`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({} as CreateKeywordDto)

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is not of type string`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: [124532452345] })

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is too short`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '12' } as CreateKeywordDto)

      expect(status).toBe(400)
    })

    it(`Should throw BadRequestException if the name is too long`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .patch(updateKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'updated'.repeat(100) } as CreateKeywordDto)

      expect(status).toBe(400)
    })
  })

  describe(`➡ "${deleteKeywordPath}" (${deleteKeywordMethod})`, () => {
    it(`Should be a private endpoint`, async () => {
      const { status } = await request(app.getHttpServer()).delete(deleteKeywordPath + '/1')

      expect(status).toBe(401)
    })

    it(`Should return 200 and success message`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .delete(deleteKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(200)
      expect(body.message).toBeDefined()
    })

    it(`Should throw NotFoundException If I tried do delete it again`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const response = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      await request(app.getHttpServer())
        .delete(deleteKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      const { status, body } = await request(app.getHttpServer())
        .delete(deleteKeywordPath + `/${response.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(404)
    })

    it(`Should throw BadRequestException If it's attached to any post`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { body: createdKeyword } = await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { body: createdTag } = await request(app.getHttpServer())
        .post(createTagPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateTagDto)

      const { body: createdSeries } = await request(app.getHttpServer())
        .post(createSeriesPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'title', description: 'description', imageUrl: 'https://example.com' } as CreateSeriesDto)

      await request(app.getHttpServer())
        .post(createPostPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'title',
          description: 'description',
          content: 'this is content',
          imageUrl: 'https://example.com',
          tags: [createdTag._id],
          series: [createdSeries._id],
          keywords: [createdKeyword._id],
        } as CreatePostDto)

      const { status } = await request(app.getHttpServer())
        .delete(deleteKeywordPath + `/${createdKeyword._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(400)
    })
  })

  describe(`➡ "${getAllKeywordsCountPath}" (${getAllKeywordsCountMethod})`, () => {
    it(`Should be a private endpoint`, async () => {
      const { status } = await request(app.getHttpServer()).delete(getAllKeywordsCountPath)

      expect(status).toBe(401)
    })

    it(`Should return 200 and count result message`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer())
        .get(getAllKeywordsCountPath)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(200)
      expect(body.count).toBe(1)
    })

    it(`Should throw NotFoundEXception if not keywords are found`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      const { status, body } = await request(app.getHttpServer())
        .get(getAllKeywordsCountPath)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(status).toBe(200)
      expect(body.count).toBe(0)
    })
  })

  describe(`➡ "${getAllKeywordsPath}" (${getAllKeywordsMethod})`, () => {
    it(`Should return 200 and array of found keywords`, async () => {
      const loginPayload = { email: appConfig.seeders.rootUser.email, password: appConfig.seeders.rootUser.password }

      const {
        body: { accessToken },
      } = await request(app.getHttpServer()).post(loginPath).send(loginPayload)

      await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test1' } as CreateKeywordDto)

      await request(app.getHttpServer())
        .post(createKeywordPath)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'test2' } as CreateKeywordDto)

      const { status, body } = await request(app.getHttpServer()).get(getAllKeywordsPath)

      expect(status).toBe(200)
      expect(body.length).toBe(2)
    })

    it(`Should throw NotFoundException if no keywords are found`, async () => {
      const { status } = await request(app.getHttpServer()).get(getAllKeywordsPath)

      expect(status).toBe(404)
    })
  })
})
