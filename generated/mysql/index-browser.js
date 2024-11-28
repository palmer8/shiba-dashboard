
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

exports.Prisma.Dokku_appearanceScalarFieldEnum = {
  user_id: 'user_id',
  barbershop: 'barbershop',
  clothes: 'clothes',
  tattoo: 'tattoo'
};

exports.Prisma.Dokku_blacklistScalarFieldEnum = {
  user_id: 'user_id',
  phone: 'phone',
  expiration: 'expiration'
};

exports.Prisma.Dokku_cashshopScalarFieldEnum = {
  user_id: 'user_id',
  current_cash: 'current_cash',
  cumulative_cash: 'cumulative_cash',
  current_coin: 'current_coin',
  tier_reward: 'tier_reward'
};

exports.Prisma.Dokku_chunobotScalarFieldEnum = {
  user_id: 'user_id',
  reason: 'reason',
  adminName: 'adminName'
};

exports.Prisma.Dokku_dailyScalarFieldEnum = {
  user_id: 'user_id',
  joinCount: 'joinCount',
  last_update: 'last_update',
  day_1: 'day_1',
  day_2: 'day_2',
  day_3: 'day_3',
  day_4: 'day_4',
  day_5: 'day_5',
  day_6: 'day_6',
  day_7: 'day_7',
  day_8: 'day_8',
  day_9: 'day_9',
  day_10: 'day_10',
  day_11: 'day_11',
  day_12: 'day_12',
  day_13: 'day_13',
  day_14: 'day_14',
  day_15: 'day_15',
  day_16: 'day_16',
  day_17: 'day_17',
  day_18: 'day_18',
  day_19: 'day_19',
  day_20: 'day_20',
  day_21: 'day_21',
  day_22: 'day_22',
  day_23: 'day_23',
  day_24: 'day_24',
  day_25: 'day_25',
  day_26: 'day_26',
  day_27: 'day_27',
  day_28: 'day_28',
  uptime: 'uptime',
  time_1: 'time_1',
  time_2: 'time_2',
  time_3: 'time_3',
  time_4: 'time_4',
  time_5: 'time_5',
  time_6: 'time_6'
};

exports.Prisma.Dokku_daily_chuseokScalarFieldEnum = {
  user_id: 'user_id',
  joinCount: 'joinCount',
  last_update: 'last_update',
  rewards: 'rewards'
};

exports.Prisma.Dokku_dailycheckScalarFieldEnum = {
  user_id: 'user_id',
  last_connection_date: 'last_connection_date',
  joinCount: 'joinCount',
  today_playtime: 'today_playtime',
  attendance_rewards: 'attendance_rewards',
  time_rewards: 'time_rewards'
};

exports.Prisma.Dokku_danceScalarFieldEnum = {
  song_id: 'song_id',
  user_id: 'user_id',
  name: 'name',
  score: 'score'
};

exports.Prisma.Dokku_fishScalarFieldEnum = {
  user_id: 'user_id',
  fish: 'fish',
  kg: 'kg',
  count: 'count'
};

exports.Prisma.Dokku_fish_rankScalarFieldEnum = {
  user_id: 'user_id',
  name: 'name',
  fish: 'fish',
  fish_kg: 'fish_kg',
  count: 'count'
};

exports.Prisma.Dokku_giftboxScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  item: 'item',
  item_amount: 'item_amount',
  need_item: 'need_item',
  need_amount: 'need_amount'
};

exports.Prisma.Dokku_hottime_eventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  start_time: 'start_time',
  end_time: 'end_time',
  reward: 'reward'
};

exports.Prisma.Dokku_hottime_logScalarFieldEnum = {
  event_id: 'event_id',
  user_id: 'user_id',
  claimed_at: 'claimed_at'
};

exports.Prisma.Dokku_houseScalarFieldEnum = {
  user_id: 'user_id',
  idx: 'idx',
  holds: 'holds',
  design: 'design',
  members: 'members',
  clothes: 'clothes'
};

exports.Prisma.Dokku_incident_reportScalarFieldEnum = {
  report_id: 'report_id',
  reason: 'reason',
  incident_description: 'incident_description',
  incident_time: 'incident_time',
  target_user_id: 'target_user_id',
  target_user_nickname: 'target_user_nickname',
  reporting_user_id: 'reporting_user_id',
  reporting_user_nickname: 'reporting_user_nickname',
  penalty_type: 'penalty_type',
  warning_count: 'warning_count',
  detention_time_minutes: 'detention_time_minutes',
  ban_duration_hours: 'ban_duration_hours',
  admin: 'admin'
};

exports.Prisma.Dokku_jailScalarFieldEnum = {
  user_id: 'user_id',
  time: 'time',
  admin: 'admin'
};

exports.Prisma.Dokku_lotto_dailyScalarFieldEnum = {
  user_id: 'user_id',
  count: 'count',
  name: 'name'
};

exports.Prisma.Dokku_newbieScalarFieldEnum = {
  user_id: 'user_id',
  code: 'code',
  newbieState: 'newbieState',
  termsState: 'termsState',
  created_at: 'created_at'
};

exports.Prisma.Dokku_questsScalarFieldEnum = {
  user_id: 'user_id',
  type: 'type',
  value: 'value',
  step: 'step',
  done: 'done'
};

exports.Prisma.Dokku_skillsScalarFieldEnum = {
  user_id: 'user_id',
  fishing: 'fishing',
  newspaper: 'newspaper',
  mining: 'mining',
  drug: 'drug',
  hamburger: 'hamburger'
};

exports.Prisma.Dokku_tattoosScalarFieldEnum = {
  user_id: 'user_id',
  tattoos: 'tattoos'
};

exports.Prisma.Dokku_taxScalarFieldEnum = {
  id: 'id',
  statecoffers: 'statecoffers',
  hi: 'hi',
  army: 'army'
};

exports.Prisma.Dokku_tebexScalarFieldEnum = {
  code: 'code',
  packagename: 'packagename'
};

exports.Prisma.Dokku_tebex_logScalarFieldEnum = {
  id: 'id',
  transid: 'transid',
  price: 'price',
  email: 'email',
  ip: 'ip',
  packagename: 'packagename',
  date: 'date'
};

exports.Prisma.Dokku_usermarketScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  type: 'type',
  title: 'title',
  image: 'image',
  item_name: 'item_name',
  item_code: 'item_code',
  item_type: 'item_type',
  item_content: 'item_content',
  amount: 'amount',
  price: 'price',
  sell_price: 'sell_price',
  time: 'time'
};

exports.Prisma.Dokku_warningScalarFieldEnum = {
  user_id: 'user_id',
  count: 'count'
};

exports.Prisma.Dokku_whitelist_ipScalarFieldEnum = {
  id: 'id',
  user_ip: 'user_ip',
  status: 'status',
  comment: 'comment',
  registrant: 'registrant',
  date: 'date'
};

exports.Prisma.Maple_tree_growthScalarFieldEnum = {
  user_id: 'user_id',
  fertilizer_gauge: 'fertilizer_gauge',
  water_gauge: 'water_gauge',
  growth_gauge: 'growth_gauge',
  fertilizer_last_update: 'fertilizer_last_update',
  water_last_update: 'water_last_update',
  created_time: 'created_time',
  growth_last_update: 'growth_last_update'
};

exports.Prisma.Pd_extraScalarFieldEnum = {
  id: 'id',
  player: 'player',
  tag: 'tag',
  data: 'data',
  created_at: 'created_at'
};

exports.Prisma.Phone_backupsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number'
};

exports.Prisma.Phone_clock_alarmsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  hours: 'hours',
  minutes: 'minutes',
  label: 'label',
  enabled: 'enabled'
};

exports.Prisma.Phone_cryptoScalarFieldEnum = {
  id: 'id',
  coin: 'coin',
  amount: 'amount',
  invested: 'invested'
};

exports.Prisma.Phone_darkchat_accountsScalarFieldEnum = {
  phone_number: 'phone_number',
  username: 'username',
  password: 'password'
};

exports.Prisma.Phone_darkchat_channelsScalarFieldEnum = {
  name: 'name'
};

exports.Prisma.Phone_darkchat_membersScalarFieldEnum = {
  channel_name: 'channel_name',
  username: 'username'
};

exports.Prisma.Phone_darkchat_messagesScalarFieldEnum = {
  id: 'id',
  channel: 'channel',
  sender: 'sender',
  content: 'content',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_accountsScalarFieldEnum = {
  display_name: 'display_name',
  username: 'username',
  password: 'password',
  profile_image: 'profile_image',
  bio: 'bio',
  post_count: 'post_count',
  story_count: 'story_count',
  follower_count: 'follower_count',
  following_count: 'following_count',
  phone_number: 'phone_number',
  private: 'private',
  verified: 'verified',
  date_joined: 'date_joined'
};

exports.Prisma.Phone_instagram_commentsScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  username: 'username',
  comment: 'comment',
  like_count: 'like_count',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_follow_requestsScalarFieldEnum = {
  requester: 'requester',
  requestee: 'requestee',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_followsScalarFieldEnum = {
  followed: 'followed',
  follower: 'follower'
};

exports.Prisma.Phone_instagram_likesScalarFieldEnum = {
  id: 'id',
  username: 'username',
  is_comment: 'is_comment'
};

exports.Prisma.Phone_instagram_messagesScalarFieldEnum = {
  id: 'id',
  sender: 'sender',
  recipient: 'recipient',
  content: 'content',
  attachments: 'attachments',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_notificationsScalarFieldEnum = {
  id: 'id',
  username: 'username',
  from: 'from',
  type: 'type',
  post_id: 'post_id',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_postsScalarFieldEnum = {
  id: 'id',
  media: 'media',
  caption: 'caption',
  location: 'location',
  like_count: 'like_count',
  comment_count: 'comment_count',
  username: 'username',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_storiesScalarFieldEnum = {
  id: 'id',
  username: 'username',
  image: 'image',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_instagram_stories_viewsScalarFieldEnum = {
  story_id: 'story_id',
  viewer: 'viewer',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_last_phoneScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number'
};

exports.Prisma.Phone_logged_in_accountsScalarFieldEnum = {
  phone_number: 'phone_number',
  app: 'app',
  username: 'username',
  active: 'active'
};

exports.Prisma.Phone_mail_accountsScalarFieldEnum = {
  address: 'address',
  password: 'password'
};

exports.Prisma.Phone_mail_deletedScalarFieldEnum = {
  message_id: 'message_id',
  address: 'address'
};

exports.Prisma.Phone_mail_messagesScalarFieldEnum = {
  id: 'id',
  recipient: 'recipient',
  sender: 'sender',
  subject: 'subject',
  content: 'content',
  attachments: 'attachments',
  actions: 'actions',
  read: 'read',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_maps_locationsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  name: 'name',
  x_pos: 'x_pos',
  y_pos: 'y_pos'
};

exports.Prisma.Phone_marketplace_postsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  title: 'title',
  description: 'description',
  attachments: 'attachments',
  price: 'price',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_message_channelsScalarFieldEnum = {
  id: 'id',
  is_group: 'is_group',
  name: 'name',
  last_message: 'last_message',
  last_message_timestamp: 'last_message_timestamp'
};

exports.Prisma.Phone_message_membersScalarFieldEnum = {
  channel_id: 'channel_id',
  phone_number: 'phone_number',
  is_owner: 'is_owner',
  deleted: 'deleted',
  unread: 'unread'
};

exports.Prisma.Phone_message_messagesScalarFieldEnum = {
  id: 'id',
  channel_id: 'channel_id',
  sender: 'sender',
  content: 'content',
  attachments: 'attachments',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_music_playlistsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  name: 'name',
  cover: 'cover'
};

exports.Prisma.Phone_music_saved_playlistsScalarFieldEnum = {
  playlist_id: 'playlist_id',
  phone_number: 'phone_number'
};

exports.Prisma.Phone_music_songsScalarFieldEnum = {
  song_id: 'song_id',
  playlist_id: 'playlist_id'
};

exports.Prisma.Phone_notesScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  title: 'title',
  content: 'content',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_notificationsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  app: 'app',
  title: 'title',
  content: 'content',
  thumbnail: 'thumbnail',
  avatar: 'avatar',
  show_avatar: 'show_avatar',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_phone_blocked_numbersScalarFieldEnum = {
  phone_number: 'phone_number',
  blocked_number: 'blocked_number'
};

exports.Prisma.Phone_phone_callsScalarFieldEnum = {
  id: 'id',
  caller: 'caller',
  callee: 'callee',
  duration: 'duration',
  answered: 'answered',
  hide_caller_id: 'hide_caller_id',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_phone_contactsScalarFieldEnum = {
  contact_phone_number: 'contact_phone_number',
  firstname: 'firstname',
  lastname: 'lastname',
  profile_image: 'profile_image',
  email: 'email',
  address: 'address',
  favourite: 'favourite',
  phone_number: 'phone_number'
};

exports.Prisma.Phone_phone_voicemailScalarFieldEnum = {
  id: 'id',
  caller: 'caller',
  callee: 'callee',
  url: 'url',
  duration: 'duration',
  hide_caller_id: 'hide_caller_id',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_phonesScalarFieldEnum = {
  id: 'id',
  owner_id: 'owner_id',
  phone_number: 'phone_number',
  name: 'name',
  pin: 'pin',
  face_id: 'face_id',
  settings: 'settings',
  is_setup: 'is_setup',
  assigned: 'assigned',
  battery: 'battery'
};

exports.Prisma.Phone_photo_album_photosScalarFieldEnum = {
  album_id: 'album_id',
  photo_id: 'photo_id'
};

exports.Prisma.Phone_photo_albumsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  title: 'title'
};

exports.Prisma.Phone_photosScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  link: 'link',
  is_video: 'is_video',
  size: 'size',
  metadata: 'metadata',
  is_favourite: 'is_favourite',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_services_channelsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  company: 'company',
  last_message: 'last_message',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_services_messagesScalarFieldEnum = {
  id: 'id',
  channel_id: 'channel_id',
  sender: 'sender',
  message: 'message',
  x_pos: 'x_pos',
  y_pos: 'y_pos',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_accountsScalarFieldEnum = {
  name: 'name',
  bio: 'bio',
  avatar: 'avatar',
  username: 'username',
  password: 'password',
  verified: 'verified',
  follower_count: 'follower_count',
  following_count: 'following_count',
  like_count: 'like_count',
  video_count: 'video_count',
  twitter: 'twitter',
  instagram: 'instagram',
  show_likes: 'show_likes',
  phone_number: 'phone_number',
  date_joined: 'date_joined'
};

exports.Prisma.Phone_tiktok_channelsScalarFieldEnum = {
  id: 'id',
  last_message: 'last_message',
  member_1: 'member_1',
  member_2: 'member_2',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_commentsScalarFieldEnum = {
  id: 'id',
  reply_to: 'reply_to',
  video_id: 'video_id',
  username: 'username',
  comment: 'comment',
  likes: 'likes',
  replies: 'replies',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_comments_likesScalarFieldEnum = {
  username: 'username',
  comment_id: 'comment_id'
};

exports.Prisma.Phone_tiktok_followsScalarFieldEnum = {
  followed: 'followed',
  follower: 'follower'
};

exports.Prisma.Phone_tiktok_likesScalarFieldEnum = {
  username: 'username',
  video_id: 'video_id'
};

exports.Prisma.Phone_tiktok_messagesScalarFieldEnum = {
  id: 'id',
  channel_id: 'channel_id',
  sender: 'sender',
  content: 'content',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_notificationsScalarFieldEnum = {
  id: 'id',
  username: 'username',
  from: 'from',
  type: 'type',
  video_id: 'video_id',
  comment_id: 'comment_id',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_pinned_videosScalarFieldEnum = {
  username: 'username',
  video_id: 'video_id'
};

exports.Prisma.Phone_tiktok_savesScalarFieldEnum = {
  username: 'username',
  video_id: 'video_id'
};

exports.Prisma.Phone_tiktok_unread_messagesScalarFieldEnum = {
  username: 'username',
  channel_id: 'channel_id',
  amount: 'amount'
};

exports.Prisma.Phone_tiktok_videosScalarFieldEnum = {
  id: 'id',
  username: 'username',
  src: 'src',
  caption: 'caption',
  metadata: 'metadata',
  music: 'music',
  likes: 'likes',
  comments: 'comments',
  views: 'views',
  saves: 'saves',
  pinned_comment: 'pinned_comment',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tiktok_viewsScalarFieldEnum = {
  username: 'username',
  video_id: 'video_id'
};

exports.Prisma.Phone_tinder_accountsScalarFieldEnum = {
  name: 'name',
  phone_number: 'phone_number',
  photos: 'photos',
  bio: 'bio',
  dob: 'dob',
  is_male: 'is_male',
  interested_men: 'interested_men',
  interested_women: 'interested_women',
  active: 'active'
};

exports.Prisma.Phone_tinder_matchesScalarFieldEnum = {
  phone_number_1: 'phone_number_1',
  phone_number_2: 'phone_number_2',
  latest_message: 'latest_message',
  latest_message_timestamp: 'latest_message_timestamp'
};

exports.Prisma.Phone_tinder_messagesScalarFieldEnum = {
  id: 'id',
  sender: 'sender',
  recipient: 'recipient',
  content: 'content',
  attachments: 'attachments',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_tinder_swipesScalarFieldEnum = {
  swiper: 'swiper',
  swipee: 'swipee',
  liked: 'liked'
};

exports.Prisma.Phone_twitter_accountsScalarFieldEnum = {
  display_name: 'display_name',
  username: 'username',
  password: 'password',
  phone_number: 'phone_number',
  bio: 'bio',
  profile_image: 'profile_image',
  profile_header: 'profile_header',
  pinned_tweet: 'pinned_tweet',
  verified: 'verified',
  follower_count: 'follower_count',
  following_count: 'following_count',
  private: 'private',
  date_joined: 'date_joined'
};

exports.Prisma.Phone_twitter_follow_requestsScalarFieldEnum = {
  requester: 'requester',
  requestee: 'requestee',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_twitter_followsScalarFieldEnum = {
  followed: 'followed',
  follower: 'follower',
  notifications: 'notifications'
};

exports.Prisma.Phone_twitter_hashtagsScalarFieldEnum = {
  hashtag: 'hashtag',
  amount: 'amount',
  last_used: 'last_used'
};

exports.Prisma.Phone_twitter_likesScalarFieldEnum = {
  tweet_id: 'tweet_id',
  username: 'username',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_twitter_messagesScalarFieldEnum = {
  id: 'id',
  sender: 'sender',
  recipient: 'recipient',
  content: 'content',
  attachments: 'attachments',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_twitter_notificationsScalarFieldEnum = {
  id: 'id',
  username: 'username',
  from: 'from',
  type: 'type',
  tweet_id: 'tweet_id',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_twitter_promotedScalarFieldEnum = {
  tweet_id: 'tweet_id',
  promotions: 'promotions',
  views: 'views'
};

exports.Prisma.Phone_twitter_retweetsScalarFieldEnum = {
  tweet_id: 'tweet_id',
  username: 'username',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_twitter_tweetsScalarFieldEnum = {
  id: 'id',
  username: 'username',
  content: 'content',
  attachments: 'attachments',
  reply_to: 'reply_to',
  like_count: 'like_count',
  reply_count: 'reply_count',
  retweet_count: 'retweet_count',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_voice_memos_recordingsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  file_name: 'file_name',
  file_url: 'file_url',
  file_length: 'file_length',
  created_at: 'created_at'
};

exports.Prisma.Phone_wallet_transactionsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  amount: 'amount',
  company: 'company',
  logo: 'logo',
  timestamp: 'timestamp'
};

exports.Prisma.Phone_yellow_pages_postsScalarFieldEnum = {
  id: 'id',
  phone_number: 'phone_number',
  title: 'title',
  description: 'description',
  attachment: 'attachment',
  price: 'price',
  timestamp: 'timestamp'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  type: 'type'
};

exports.Prisma.Vrp_dataitem_idsScalarFieldEnum = {
  id: 'id',
  data: 'data',
  u_str: 'u_str',
  created_at: 'created_at'
};

exports.Prisma.Vrp_srv_dataScalarFieldEnum = {
  dkey: 'dkey',
  dvalue: 'dvalue'
};

exports.Prisma.Vrp_titlebox_olduserScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  count: 'count',
  created_at: 'created_at'
};

exports.Prisma.Vrp_user_dataScalarFieldEnum = {
  user_id: 'user_id',
  inventory: 'inventory',
  groups: 'groups',
  weapons: 'weapons',
  health: 'health',
  position: 'position',
  customization: 'customization',
  skinitem_skinid: 'skinitem_skinid',
  skinitem_idle: 'skinitem_idle',
  mute: 'mute'
};

exports.Prisma.Vrp_user_identitiesScalarFieldEnum = {
  user_id: 'user_id',
  registration: 'registration',
  phone: 'phone',
  firstname: 'firstname',
  name: 'name',
  age: 'age',
  car_seize: 'car_seize',
  first: 'first',
  first_join: 'first_join'
};

exports.Prisma.Vrp_user_idsScalarFieldEnum = {
  identifier: 'identifier',
  user_id: 'user_id',
  banned: 'banned'
};

exports.Prisma.Vrp_user_moneysScalarFieldEnum = {
  user_id: 'user_id',
  wallet: 'wallet',
  bank: 'bank',
  credit: 'credit',
  credit2: 'credit2',
  exp: 'exp',
  drug_exp: 'drug_exp',
  exercise: 'exercise',
  criminal: 'criminal'
};

exports.Prisma.Vrp_user_vehiclesScalarFieldEnum = {
  user_id: 'user_id',
  vehicle: 'vehicle',
  vehicle_plate: 'vehicle_plate',
  rented: 'rented',
  rentedid: 'rentedid',
  rentedtime: 'rentedtime',
  modifications: 'modifications'
};

exports.Prisma.Vrp_usersScalarFieldEnum = {
  id: 'id',
  last_login: 'last_login',
  whitelisted: 'whitelisted',
  banned: 'banned',
  bantime: 'bantime',
  banreason: 'banreason',
  banadmin: 'banadmin'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.dokku_incident_report_penalty_type = exports.$Enums.dokku_incident_report_penalty_type = {
  WARNING: 'WARNING',
  GAME_BAN: 'GAME_BAN',
  VERBAL_WARNING: 'VERBAL_WARNING',
  BAN_RELEASE: 'BAN_RELEASE'
};

exports.Prisma.ModelName = {
  dokku_appearance: 'dokku_appearance',
  dokku_blacklist: 'dokku_blacklist',
  dokku_cashshop: 'dokku_cashshop',
  dokku_chunobot: 'dokku_chunobot',
  dokku_daily: 'dokku_daily',
  dokku_daily_chuseok: 'dokku_daily_chuseok',
  dokku_dailycheck: 'dokku_dailycheck',
  dokku_dance: 'dokku_dance',
  dokku_fish: 'dokku_fish',
  dokku_fish_rank: 'dokku_fish_rank',
  dokku_giftbox: 'dokku_giftbox',
  dokku_hottime_event: 'dokku_hottime_event',
  dokku_hottime_log: 'dokku_hottime_log',
  dokku_house: 'dokku_house',
  dokku_incident_report: 'dokku_incident_report',
  dokku_jail: 'dokku_jail',
  dokku_lotto_daily: 'dokku_lotto_daily',
  dokku_newbie: 'dokku_newbie',
  dokku_quests: 'dokku_quests',
  dokku_skills: 'dokku_skills',
  dokku_tattoos: 'dokku_tattoos',
  dokku_tax: 'dokku_tax',
  dokku_tebex: 'dokku_tebex',
  dokku_tebex_log: 'dokku_tebex_log',
  dokku_usermarket: 'dokku_usermarket',
  dokku_warning: 'dokku_warning',
  dokku_whitelist_ip: 'dokku_whitelist_ip',
  maple_tree_growth: 'maple_tree_growth',
  pd_extra: 'pd_extra',
  phone_backups: 'phone_backups',
  phone_clock_alarms: 'phone_clock_alarms',
  phone_crypto: 'phone_crypto',
  phone_darkchat_accounts: 'phone_darkchat_accounts',
  phone_darkchat_channels: 'phone_darkchat_channels',
  phone_darkchat_members: 'phone_darkchat_members',
  phone_darkchat_messages: 'phone_darkchat_messages',
  phone_instagram_accounts: 'phone_instagram_accounts',
  phone_instagram_comments: 'phone_instagram_comments',
  phone_instagram_follow_requests: 'phone_instagram_follow_requests',
  phone_instagram_follows: 'phone_instagram_follows',
  phone_instagram_likes: 'phone_instagram_likes',
  phone_instagram_messages: 'phone_instagram_messages',
  phone_instagram_notifications: 'phone_instagram_notifications',
  phone_instagram_posts: 'phone_instagram_posts',
  phone_instagram_stories: 'phone_instagram_stories',
  phone_instagram_stories_views: 'phone_instagram_stories_views',
  phone_last_phone: 'phone_last_phone',
  phone_logged_in_accounts: 'phone_logged_in_accounts',
  phone_mail_accounts: 'phone_mail_accounts',
  phone_mail_deleted: 'phone_mail_deleted',
  phone_mail_messages: 'phone_mail_messages',
  phone_maps_locations: 'phone_maps_locations',
  phone_marketplace_posts: 'phone_marketplace_posts',
  phone_message_channels: 'phone_message_channels',
  phone_message_members: 'phone_message_members',
  phone_message_messages: 'phone_message_messages',
  phone_music_playlists: 'phone_music_playlists',
  phone_music_saved_playlists: 'phone_music_saved_playlists',
  phone_music_songs: 'phone_music_songs',
  phone_notes: 'phone_notes',
  phone_notifications: 'phone_notifications',
  phone_phone_blocked_numbers: 'phone_phone_blocked_numbers',
  phone_phone_calls: 'phone_phone_calls',
  phone_phone_contacts: 'phone_phone_contacts',
  phone_phone_voicemail: 'phone_phone_voicemail',
  phone_phones: 'phone_phones',
  phone_photo_album_photos: 'phone_photo_album_photos',
  phone_photo_albums: 'phone_photo_albums',
  phone_photos: 'phone_photos',
  phone_services_channels: 'phone_services_channels',
  phone_services_messages: 'phone_services_messages',
  phone_tiktok_accounts: 'phone_tiktok_accounts',
  phone_tiktok_channels: 'phone_tiktok_channels',
  phone_tiktok_comments: 'phone_tiktok_comments',
  phone_tiktok_comments_likes: 'phone_tiktok_comments_likes',
  phone_tiktok_follows: 'phone_tiktok_follows',
  phone_tiktok_likes: 'phone_tiktok_likes',
  phone_tiktok_messages: 'phone_tiktok_messages',
  phone_tiktok_notifications: 'phone_tiktok_notifications',
  phone_tiktok_pinned_videos: 'phone_tiktok_pinned_videos',
  phone_tiktok_saves: 'phone_tiktok_saves',
  phone_tiktok_unread_messages: 'phone_tiktok_unread_messages',
  phone_tiktok_videos: 'phone_tiktok_videos',
  phone_tiktok_views: 'phone_tiktok_views',
  phone_tinder_accounts: 'phone_tinder_accounts',
  phone_tinder_matches: 'phone_tinder_matches',
  phone_tinder_messages: 'phone_tinder_messages',
  phone_tinder_swipes: 'phone_tinder_swipes',
  phone_twitter_accounts: 'phone_twitter_accounts',
  phone_twitter_follow_requests: 'phone_twitter_follow_requests',
  phone_twitter_follows: 'phone_twitter_follows',
  phone_twitter_hashtags: 'phone_twitter_hashtags',
  phone_twitter_likes: 'phone_twitter_likes',
  phone_twitter_messages: 'phone_twitter_messages',
  phone_twitter_notifications: 'phone_twitter_notifications',
  phone_twitter_promoted: 'phone_twitter_promoted',
  phone_twitter_retweets: 'phone_twitter_retweets',
  phone_twitter_tweets: 'phone_twitter_tweets',
  phone_voice_memos_recordings: 'phone_voice_memos_recordings',
  phone_wallet_transactions: 'phone_wallet_transactions',
  phone_yellow_pages_posts: 'phone_yellow_pages_posts',
  user: 'user',
  vrp_dataitem_ids: 'vrp_dataitem_ids',
  vrp_srv_data: 'vrp_srv_data',
  vrp_titlebox_olduser: 'vrp_titlebox_olduser',
  vrp_user_data: 'vrp_user_data',
  vrp_user_identities: 'vrp_user_identities',
  vrp_user_ids: 'vrp_user_ids',
  vrp_user_moneys: 'vrp_user_moneys',
  vrp_user_vehicles: 'vrp_user_vehicles',
  vrp_users: 'vrp_users'
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
