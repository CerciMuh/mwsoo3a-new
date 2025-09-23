// Infrastructure Layer - DynamoDB Repository for Users
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { IUserRepository } from '../../domain/repositories/interfaces';
import { User } from '../../domain/entities/User';

export class DynamoDbUserRepository implements IUserRepository {
  private tableName: string;
  private doc: DynamoDBDocumentClient;

  constructor(tableName?: string, client?: DynamoDBClient) {
    this.tableName = tableName || process.env.DYNAMO_USERS_TABLE || 'Users';
    const ddbClient = client || new DynamoDBClient({});
    this.doc = DynamoDBDocumentClient.from(ddbClient, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }

  public async findById(id: string): Promise<User | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.tableName,
      Key: { id }
    }));
    const item = res.Item as any;
    if (!item) return null;
    return User.fromDatabase(item.id, item.email, item.universityId ? parseInt(item.universityId) : undefined, item.createdAt);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const res = await this.doc.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: '#e = :email',
      ExpressionAttributeNames: { '#e': 'email' },
      ExpressionAttributeValues: { ':email': email },
      Limit: 1
    }));
    const items = (res.Items as any[]) || [];
    const item = items[0];
    if (!item) return null;
    return User.fromDatabase(item.id, item.email, item.universityId ? parseInt(item.universityId) : undefined, item.createdAt);
  }

  public async create(user: User): Promise<User> {
    // Simple numeric id generation via timestamp; in prod prefer ULID/UUID
    const id = user.id || Date.now().toString();
    const item: any = {
      id,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
    };
    if (user.universityId !== null && user.universityId !== undefined) {
      item.universityId = user.universityId.toString();
    }
    await this.doc.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)'
    }));
    return User.fromDatabase(id, item.email, item.universityId ? parseInt(item.universityId) : undefined, item.createdAt);
  }

  public async update(id: string, userData: Partial<Pick<User, 'universityId'>>): Promise<User> {
    const res = await this.doc.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET universityId = :u',
      ExpressionAttributeValues: { ':u': userData.universityId !== undefined && userData.universityId !== null ? userData.universityId.toString() : null },
      ReturnValues: 'ALL_NEW'
    }));
    const item = res.Attributes as any;
    if (!item) throw new Error('User not found for update');
    return User.fromDatabase(item.id, item.email, item.universityId ? parseInt(item.universityId) : undefined, item.createdAt);
  }

  public async delete(id: string): Promise<void> {
    await this.doc.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    }));
  }

  public async findAll(): Promise<User[]> {
    const res = await this.doc.send(new ScanCommand({ TableName: this.tableName }));
    const items = (res.Items as any[]) || [];
    return items.map((item: any) => User.fromDatabase(item.id, item.email, item.universityId ? parseInt(item.universityId) : undefined, item.createdAt));
  }
}
