import { action, makeObservable, observable } from 'mobx';

import { DataStorage } from '../../api/data-storage';
import { ClientFile } from '../entities/File';
import RootStore from './RootStore';

/**
 * Based on https://mobx.js.org/best/store.html
 */
class CommentStore {
  private readonly backend: DataStorage;
  private readonly rootStore: RootStore;

  readonly fileList = observable<ClientFile>([]);

  constructor(backend: DataStorage, rootStore: RootStore) {
    this.backend = backend;
    this.rootStore = rootStore;

    makeObservable(this);
  }

  @action.bound async setComment(file: ClientFile, comment: string): Promise<string> {
    //this.backend.setComment(file.id, comment);

    return comment;
  }
}

export default CommentStore;
