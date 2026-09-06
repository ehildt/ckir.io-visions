import { ApiProperty } from '@nestjs/swagger';

/**
 * One title-tier main node — a topic blob's group node (between the hub and
 * its leafs) with the LLM-written summary of the attached leafs.
 */
export class MemoryMainNodeDto {
  @ApiProperty({
    description:
      'Deterministic main-node id (sha256 of lane|collection|scopeKey|groupKey).',
    example: '9f1c…',
  })
  id!: string;

  @ApiProperty({
    description:
      "Lane the main node belongs to ('partition' | 'encyclopedia').",
    example: 'partition',
  })
  lane!: string;

  @ApiProperty({
    description: "Space key: the partition key, or 'global' (encyclopedia).",
    example: 'default',
  })
  scopeKey!: string;

  @ApiProperty({
    description:
      "The blob key this main node represents — the dashboard's topic-grouping key (subject/tag/title/domain).",
    example: 'walter white',
  })
  groupKey!: string;

  @ApiProperty({
    description:
      "The group's human label (the tier's title: hub subject, document title, …).",
    example: 'CV_EN.pdf',
  })
  title!: string;

  @ApiProperty({
    description: 'LLM-written summary of the attached leafs.',
    example:
      'Six pages of a consulting CV covering the senior fullstack career, skills, and project history of the owner.',
  })
  summary!: string;

  @ApiProperty({
    description: 'Number of attached leaf points.',
    example: 25,
  })
  memberCount!: number;

  @ApiProperty({
    description: 'The leaf point ids (authoritative membership list).',
    example: ['9f1c…', 'a3b2…'],
  })
  memberIds!: string[];
}
