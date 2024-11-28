
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  hashedPassword: 'hashedPassword',
  email: 'email',
  userId: 'userId',
  emailVerified: 'emailVerified',
  nickname: 'nickname',
  image: 'image',
  role: 'role',
  isPermissive: 'isPermissive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroupMailScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  content: 'content',
  reward: 'reward',
  startDate: 'startDate',
  endDate: 'endDate',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PersonalMailScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  reason: 'reason',
  content: 'content',
  reward: 'reward',
  startDate: 'startDate',
  endDate: 'endDate',
  registrantId: 'registrantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IpBlockScalarFieldEnum = {
  id: 'id',
  ip: 'ip',
  reason: 'reason',
  registrantId: 'registrantId',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountBlockScalarFieldEnum = {
  id: 'id',
  reason: 'reason',
  userId: 'userId',
  type: 'type',
  blockDuration: 'blockDuration',
  isPermanent: 'isPermanent',
  registrantId: 'registrantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponGroupScalarFieldEnum = {
  id: 'id',
  groupName: 'groupName',
  groupType: 'groupType',
  rewards: 'rewards',
  code: 'code',
  isIssued: 'isIssued',
  usageLimit: 'usageLimit',
  groupReason: 'groupReason',
  groupStatus: 'groupStatus',
  quantity: 'quantity',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  rewards: 'rewards',
  isUsed: 'isUsed',
  code: 'code',
  couponGroupId: 'couponGroupId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  nickname: 'nickname',
  couponId: 'couponId',
  usedAt: 'usedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemQuantityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  itemName: 'itemName',
  amount: 'amount',
  type: 'type',
  status: 'status',
  registrantId: 'registrantId',
  approverId: 'approverId',
  isApproved: 'isApproved',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RewardRevokeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  status: 'status',
  type: 'type',
  creditType: 'creditType',
  registrantId: 'registrantId',
  approverId: 'approverId',
  isApproved: 'isApproved',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemsScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  itemName: 'itemName',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroupsScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  groupBoolean: 'groupBoolean',
  minRole: 'minRole',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CreditManagementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  creditType: 'creditType',
  amount: 'amount',
  status: 'status',
  registrantId: 'registrantId',
  approverId: 'approverId',
  isApproved: 'isApproved',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlockTicketScalarFieldEnum = {
  id: 'id',
  reportId: 'reportId',
  status: 'status',
  registrantId: 'registrantId',
  approverId: 'approverId',
  isApproved: 'isApproved',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BoardScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  views: 'views',
  registrantId: 'registrantId',
  isNotice: 'isNotice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BoardCommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  boardId: 'boardId',
  registrantId: 'registrantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountUsingQuerylogScalarFieldEnum = {
  id: 'id',
  content: 'content',
  registrantId: 'registrantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  STAFF: 'STAFF',
  INGAME_ADMIN: 'INGAME_ADMIN',
  MASTER: 'MASTER',
  SUPERMASTER: 'SUPERMASTER'
};

exports.IpBlockType = exports.$Enums.IpBlockType = {
  BLACKLIST: 'BLACKLIST',
  WHITELIST: 'WHITELIST'
};

exports.AccountBlockType = exports.$Enums.AccountBlockType = {
  CHAT_BLOCK: 'CHAT_BLOCK',
  ACCOUNT_BLOCK: 'ACCOUNT_BLOCK',
  CHAT_UNBLOCK: 'CHAT_UNBLOCK',
  ACCOUNT_UNBLOCK: 'ACCOUNT_UNBLOCK'
};

exports.CouponGroupType = exports.$Enums.CouponGroupType = {
  COMMON: 'COMMON',
  PUBLIC: 'PUBLIC'
};

exports.CouponGroupStatus = exports.$Enums.CouponGroupStatus = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED'
};

exports.ActionType = exports.$Enums.ActionType = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
};

exports.Status = exports.$Enums.Status = {
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED'
};

exports.RewardRevokeCreditType = exports.$Enums.RewardRevokeCreditType = {
  MONEY: 'MONEY',
  BANKMONEY: 'BANKMONEY',
  CREDIT: 'CREDIT',
  CREDIT2: 'CREDIT2',
  ITEM: 'ITEM'
};

exports.CreditType = exports.$Enums.CreditType = {
  MONEY: 'MONEY',
  BANKMONEY: 'BANKMONEY',
  CREDIT: 'CREDIT',
  CREDIT2: 'CREDIT2',
  CURRENT_COIN: 'CURRENT_COIN'
};

exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  GroupMail: 'GroupMail',
  PersonalMail: 'PersonalMail',
  IpBlock: 'IpBlock',
  AccountBlock: 'AccountBlock',
  CouponGroup: 'CouponGroup',
  Coupon: 'Coupon',
  CouponLog: 'CouponLog',
  ItemQuantity: 'ItemQuantity',
  RewardRevoke: 'RewardRevoke',
  Items: 'Items',
  Groups: 'Groups',
  CreditManagement: 'CreditManagement',
  BlockTicket: 'BlockTicket',
  Board: 'Board',
  BoardComment: 'BoardComment',
  AccountUsingQuerylog: 'AccountUsingQuerylog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
