import {
  BulkWriteOptions,
  Collection,
  CountDocumentsOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindOneAndUpdateOptions,
  FindOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  ReplaceOptions,
  UpdateResult,
  WithoutId,
} from "mongodb";

import db from "../db";

export interface BaseDoc {
  _id: ObjectId;
  dateCreated: Date;
  dateUpdated: Date;
}

export type WithoutBase<T extends BaseDoc> = Omit<T, keyof BaseDoc>;

export default class DocCollection<Schema extends BaseDoc> {
  public readonly collection: Collection<Schema>;
  private static collectionNames: Set<string> = new Set();

  constructor(public readonly name: string) {
    if (DocCollection.collectionNames.has(name)) {
      throw new Error(`Collection '${name}' already exists!`);
    }
    this.collection = db.collection(name);
  }

  /**
   * Remove internal fields from an item so that the client does not alter them.
   */
  private withoutInternal<P extends Partial<Schema>>(item: P): WithoutId<P> {
    const safe = Object.assign({}, item);
    delete safe._id;
    delete safe.dateCreated;
    delete safe.dateUpdated;
    return safe;
  }

  /**
   * Add `item` to the collection. Returns the _id of the inserted document.
   */
  async createOne(item: Partial<Schema>): Promise<ObjectId> {
    const safe = this.withoutInternal(item);
    safe.dateCreated = new Date();
    safe.dateUpdated = new Date();
    return (await this.collection.insertOne(safe as OptionalUnlessRequiredId<Schema>)).insertedId;
  }

  /**
   * Add `items` to the collection. Returns a record object of the form `{ <index>: <_id> }` for inserted documents.
   */
  async createMany(items: Partial<Schema>[], options?: BulkWriteOptions): Promise<Record<number, ObjectId>> {
    const safe = items.map((item) => {
      const safe = this.withoutInternal(item);
      safe.dateCreated = new Date();
      safe.dateUpdated = new Date();
      return safe;
    });
    return (await this.collection.insertMany(safe as OptionalUnlessRequiredId<Schema>[], options)).insertedIds;
  }

  /**
   * Read the document that matches `filter`. Returns `null` if no document matches.
   */
  async readOne(filter: Filter<Schema>, options?: FindOptions): Promise<Schema | null> {
    return await this.collection.findOne<Schema>(filter, options);
  }

  /**
   * Read all documents that match `filter`.
   */
  async readMany(filter: Filter<Schema>, options?: FindOptions): Promise<Schema[]> {
    return await this.collection.find<Schema>(filter, options).toArray();
  }

  /**
   * Replace the document that matches `filter` with `item`.
   */
  async replaceOne(filter: Filter<Schema>, item: Partial<Schema>, options?: ReplaceOptions): Promise<UpdateResult<Schema> | Document> {
    const safe = this.withoutInternal(item);
    return await this.collection.replaceOne(filter, safe as WithoutId<Schema>, options);
  }

  /**
   * Update the document that matches `filter` based on existing fields in `update`.
   * Only the given fields in `update` get updated.
   */
  async partialUpdateOne(filter: Filter<Schema>, update: Partial<Schema>, options?: FindOneAndUpdateOptions): Promise<UpdateResult<Schema>> {
    const safe = this.withoutInternal(update);
    safe.dateUpdated = new Date();
    return await this.collection.updateOne(filter, { $set: safe as Partial<Schema> }, options);
  }

  /**
   * Delete the document that matches `filter`.
   */
  async deleteOne(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.collection.deleteOne(filter, options);
  }

  /**
   * Delete all documents that match `filter`.
   */
  async deleteMany(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.collection.deleteMany(filter, options);
  }

  /**
   * Count all documents that match `filter`.
   */
  async count(filter: Filter<Schema>, options?: CountDocumentsOptions): Promise<number> {
    return await this.collection.countDocuments(filter, options);
  }

  /**
   * Pop one document that matches `filter`.
   * This method is equivalent to calling `readOne` and `deleteOne`.
   */
  async popOne(filter: Filter<Schema>): Promise<Schema | null> {
    const one = await this.readOne(filter);
    if (one === null) {
      return null;
    }
    await this.deleteOne({ _id: one._id } as Filter<Schema>);
    return one;
  }

  // Feel free to add your own functions!
}
