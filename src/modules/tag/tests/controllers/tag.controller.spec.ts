import { Test, TestingModule } from '@nestjs/testing'
import { TagController } from '../../controllers/private/private-tag.controller'

describe('TagController', () => {
  let controller: TagController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
    }).compile()

    controller = module.get<TagController>(TagController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
