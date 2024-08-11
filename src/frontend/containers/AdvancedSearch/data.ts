import { generateWidgetId } from 'widgets/utility';
import { NumberOperatorType, StringOperatorType } from '../../../api/data-storage-search';
import { FileDTO, IMG_EXTENSIONS } from '../../../api/file';
import { ID } from '../../../api/id';
import { BinaryOperatorType, OperatorType, TagOperatorType } from '../../../api/search-criteria';
import {
  ClientDateSearchCriteria,
  ClientFileSearchCriteria,
  ClientNumberSearchCriteria,
  ClientStringSearchCriteria,
  ClientTagSearchCriteria,
} from '../../entities/SearchCriteria';
import TagStore from '../../stores/TagStore';

import exiftool from 'node-exiftool';

export function generateCriteriaId() {
  return generateWidgetId('__criteria');
}

export type Criteria =
  | Field<'name' | 'absolutePath', StringOperatorType, string>
  | Field<'tags', TagOperatorType, TagValue>
  | Field<'extension', BinaryOperatorType, string>
  | Field<'size', NumberOperatorType, number>
  | Field<'width' | 'height', NumberOperatorType, number>
  | Field<'dateAdded', NumberOperatorType, Date>
  | Field<'comments', StringOperatorType, string>
  | Field<'Creator', StringOperatorType, string>;

interface Field<K extends Key, O extends Operator, V extends Value> {
  key: K;
  operator: O;
  value: V;
}

type FileKeys = keyof Pick<
  FileDTO,
  | 'name'
  | 'absolutePath'
  | 'tags'
  | 'extension'
  | 'size'
  | 'width'
  | 'height'
  | 'dateAdded'
  | 'comments'
>;

type ExiftoolKeys = keyof Pick<exiftool.IMetadata, 'Creator'>;

export type Key = FileKeys | ExiftoolKeys;

/*export type Key = keyof Pick<
  FileDTO,
  | 'name'
  | 'absolutePath'
  | 'tags'
  | 'extension'
  | 'size'
  | 'width'
  | 'height'
  | 'dateAdded'
  | 'comments'
  exiftool,
  'creator'
>;*/

export type Operator = OperatorType;
export type Value = string | number | Date | TagValue;
export type TagValue = ID | undefined;

export function defaultQuery(key: Key): Criteria {
  if (key === 'name' || key === 'absolutePath') {
    return { key, operator: 'contains', value: '' };
  } else if (key === 'tags') {
    return { key, operator: 'contains', value: undefined };
  } else if (key === 'extension') {
    return {
      key,
      operator: 'equals',
      value: IMG_EXTENSIONS[0],
    };
  } else if (key === 'dateAdded') {
    return {
      key,
      operator: 'equals',
      value: new Date(),
    };
  } else if (key === 'comments' || key === 'Creator') {
    return { key, operator: 'contains', value: '' };
  } else {
    return { key, operator: 'greaterThanOrEquals', value: 0 };
  }
}

const BYTES_IN_MB = 1024 * 1024;

export function fromCriteria(criteria: ClientFileSearchCriteria): [ID, Criteria] {
  const query = defaultQuery('tags');
  // Preserve the value when the criteria has the same type of value
  if (
    criteria instanceof ClientStringSearchCriteria &&
    (criteria.key === 'name' ||
      criteria.key === 'absolutePath' ||
      criteria.key === 'extension' ||
      criteria.key === 'comments' ||
      criteria.key === 'Creator')
  ) {
    query.value = criteria.value;
  } else if (criteria instanceof ClientDateSearchCriteria && criteria.key === 'dateAdded') {
    query.value = criteria.value;
  } else if (criteria instanceof ClientNumberSearchCriteria && criteria.key === 'size') {
    query.value = criteria.value / BYTES_IN_MB;
  } else if (criteria instanceof ClientTagSearchCriteria && criteria.key === 'tags') {
    const id = criteria.value;
    query.value = id;
  } else if (
    criteria instanceof ClientNumberSearchCriteria &&
    (criteria.key === 'width' || criteria.key === 'height')
  ) {
    query.value = criteria.value;
  } else {
    return [generateCriteriaId(), query];
  }
  query.key = criteria.key;
  query.operator = criteria.operator;
  return [generateCriteriaId(), query];
}

export function intoCriteria(query: Criteria, tagStore: TagStore): ClientFileSearchCriteria {
  if (
    query.key === 'name' ||
    query.key === 'absolutePath' ||
    query.key === 'extension' ||
    query.key == 'comments' ||
    query.key == 'Creator'
  ) {
    console.log(query.key, query.value, query.operator);
    return new ClientStringSearchCriteria(query.key, query.value, query.operator);
  } else if (query.key === 'dateAdded') {
    return new ClientDateSearchCriteria(query.key, query.value, query.operator);
  } else if (query.key === 'size') {
    return new ClientNumberSearchCriteria(query.key, query.value * BYTES_IN_MB, query.operator);
  } else if (query.key === 'width' || query.key === 'height') {
    return new ClientNumberSearchCriteria(query.key, query.value, query.operator);
  } else if (query.key === 'tags') {
    const tag = query.value !== undefined ? tagStore.get(query.value) : undefined;
    return new ClientTagSearchCriteria('tags', tag?.id, query.operator);
  } else {
    return new ClientTagSearchCriteria('tags');
  }
}
