import { Module } from '@nestjs/common';
import { ArtifactController } from './artifact.controller';
import { ArtifactService } from './artifact.service';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';

@Module({
  controllers: [DraftController, ArtifactController],
  providers: [DraftService, ArtifactService],
})
export class ToolDataModule {}
