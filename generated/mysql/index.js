
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/palmer8/repository/shiba-dashboard/generated/mysql",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/Users/palmer8/repository/shiba-dashboard/src/db/mysql/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../.env",
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../src/db/mysql",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "MYSQL_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../../../generated/mysql\"\n}\n\ndatasource db {\n  provider     = \"mysql\"\n  url          = env(\"MYSQL_DATABASE_URL\")\n  relationMode = \"prisma\"\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel betting_history {\n  user_id       Int?\n  bet_key       String? @db.VarChar(10)\n  bet_count     Int?\n  result_amount Int?\n  rand_result   Int?\n  result_color  String? @db.VarChar(10)\n\n  @@index([user_id], map: \"idx_betting_history_user_id\")\n  @@ignore\n}\n\nmodel dokku_appearance {\n  user_id    Int    @id\n  barbershop String @default(\"[]\") @db.LongText\n  clothes    String @default(\"[]\") @db.LongText\n  tattoo     String @default(\"[]\") @db.LongText\n}\n\nmodel dokku_blacklist {\n  user_id    Int\n  phone      String   @db.VarChar(50)\n  expiration DateTime @db.DateTime(0)\n\n  @@id([user_id, phone])\n}\n\nmodel dokku_cashshop {\n  user_id         Int @id\n  current_cash    Int @default(0)\n  cumulative_cash Int @default(0)\n  current_coin    Int @default(0)\n  tier_reward     Int @default(0)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_cashshoplimit {\n  user_id Int?\n  itemID  String @db.VarChar(50)\n\n  @@index([user_id], map: \"FK_dokku_cashshoplimit_vrp_users\")\n  @@ignore\n}\n\nmodel dokku_chunobot {\n  user_id   Int     @id @db.UnsignedInt\n  reason    String? @db.VarChar(255)\n  adminName String? @db.VarChar(50)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_company {\n  id      Int?\n  name    String? @db.VarChar(50)\n  capital BigInt?\n\n  @@ignore\n}\n\nmodel dokku_daily {\n  user_id     Int      @id\n  joinCount   Int      @default(1)\n  last_update DateTime @db.Date\n  day_1       Int      @default(0) @db.TinyInt\n  day_2       Int      @default(0) @db.TinyInt\n  day_3       Int      @default(0) @db.TinyInt\n  day_4       Int      @default(0) @db.TinyInt\n  day_5       Int      @default(0) @db.TinyInt\n  day_6       Int      @default(0) @db.TinyInt\n  day_7       Int      @default(0) @db.TinyInt\n  day_8       Int      @default(0) @db.TinyInt\n  day_9       Int      @default(0) @db.TinyInt\n  day_10      Int      @default(0) @db.TinyInt\n  day_11      Int      @default(0) @db.TinyInt\n  day_12      Int      @default(0) @db.TinyInt\n  day_13      Int      @default(0) @db.TinyInt\n  day_14      Int      @default(0) @db.TinyInt\n  day_15      Int      @default(0) @db.TinyInt\n  day_16      Int      @default(0) @db.TinyInt\n  day_17      Int      @default(0) @db.TinyInt\n  day_18      Int      @default(0) @db.TinyInt\n  day_19      Int      @default(0) @db.TinyInt\n  day_20      Int      @default(0) @db.TinyInt\n  day_21      Int      @default(0) @db.TinyInt\n  day_22      Int      @default(0) @db.TinyInt\n  day_23      Int      @default(0) @db.TinyInt\n  day_24      Int      @default(0) @db.TinyInt\n  day_25      Int      @default(0) @db.TinyInt\n  day_26      Int      @default(0) @db.TinyInt\n  day_27      Int      @default(0) @db.TinyInt\n  day_28      Int      @default(0) @db.TinyInt\n  uptime      Int      @default(0)\n  time_1      Int      @default(0) @db.TinyInt\n  time_2      Int      @default(0) @db.TinyInt\n  time_3      Int      @default(0) @db.TinyInt\n  time_4      Int      @default(0) @db.TinyInt\n  time_5      Int      @default(0) @db.TinyInt\n  time_6      Int      @default(0) @db.TinyInt\n\n  @@index([day_1], map: \"day_1\")\n  @@index([day_10], map: \"day_10\")\n  @@index([day_11], map: \"day_11\")\n  @@index([day_12], map: \"day_12\")\n  @@index([day_13], map: \"day_13\")\n  @@index([day_14], map: \"day_14\")\n  @@index([day_15], map: \"day_15\")\n  @@index([day_16], map: \"day_16\")\n  @@index([day_17], map: \"day_17\")\n  @@index([day_18], map: \"day_18\")\n  @@index([day_19], map: \"day_19\")\n  @@index([day_2], map: \"day_2\")\n  @@index([day_20], map: \"day_20\")\n  @@index([day_21], map: \"day_21\")\n  @@index([day_22], map: \"day_22\")\n  @@index([day_23], map: \"day_23\")\n  @@index([day_24], map: \"day_24\")\n  @@index([day_25], map: \"day_25\")\n  @@index([day_26], map: \"day_26\")\n  @@index([day_27], map: \"day_27\")\n  @@index([day_28], map: \"day_28\")\n  @@index([day_3], map: \"day_3\")\n  @@index([day_4], map: \"day_4\")\n  @@index([day_5], map: \"day_5\")\n  @@index([day_6], map: \"day_6\")\n  @@index([day_7], map: \"day_7\")\n  @@index([day_8], map: \"day_8\")\n  @@index([day_9], map: \"day_9\")\n  @@index([joinCount], map: \"joinCount\")\n  @@index([last_update], map: \"last-update\")\n  @@index([time_1], map: \"time_1\")\n  @@index([time_2], map: \"time_2\")\n  @@index([time_3], map: \"time_3\")\n  @@index([time_4], map: \"time_4\")\n  @@index([time_5], map: \"time_5\")\n  @@index([time_6], map: \"time_6\")\n  @@index([uptime], map: \"uptime\")\n}\n\nmodel dokku_daily_chuseok {\n  user_id     Int       @id\n  joinCount   Int       @default(1)\n  last_update DateTime? @db.Date\n  rewards     String?   @db.Text\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_daily_event2 {\n  user_id Int?\n  name    String?   @db.VarChar(50)\n  item    String?   @db.VarChar(50)\n  time    DateTime? @db.Timestamp(0)\n\n  @@index([user_id], map: \"FK_dokku_daily_event2_vrp_users\")\n  @@ignore\n}\n\nmodel dokku_dailycheck {\n  user_id              Int       @id @default(0)\n  last_connection_date DateTime? @default(dbgenerated(\"(curdate())\")) @db.Date\n  joinCount            Int?      @default(1)\n  today_playtime       Int?      @default(0)\n  attendance_rewards   String?   @default(\"{\\\"1\\\": false, \\\"2\\\": false, \\\"3\\\": false, \\\"4\\\": false, \\\"5\\\": false, \\\"6\\\": false, \\\"7\\\": false, \\\"8\\\": false, \\\"9\\\": false, \\\"10\\\": false, \\\"11\\\": false, \\\"12\\\": false, \\\"13\\\": false, \\\"14\\\": false, \\\"15\\\": false, \\\"16\\\": false, \\\"17\\\": false, \\\"18\\\": false, \\\"19\\\": false, \\\"20\\\": false, \\\"21\\\": false, \\\"22\\\": false, \\\"23\\\": false, \\\"24\\\": false, \\\"25\\\": false, \\\"26\\\": false, \\\"27\\\": false, \\\"28\\\": false, \\\"29\\\": false, \\\"30\\\": false}\") @db.LongText\n  time_rewards         String?   @default(\"{\\\"1\\\": false, \\\"2\\\": false, \\\"3\\\": false, \\\"4\\\": false, \\\"5\\\": false, \\\"6\\\": false}\") @db.LongText\n}\n\nmodel dokku_dance {\n  song_id Int\n  user_id Int\n  name    String @db.Text\n  score   Int\n\n  @@id([user_id, song_id])\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_eventbox {\n  user_id Int\n  date    DateTime? @db.DateTime(0)\n  finder  String?   @default(\"{}\") @db.LongText\n\n  @@index([user_id], map: \"FK_dokku_eventbox_vrp_users\")\n  @@ignore\n}\n\nmodel dokku_fish {\n  user_id Int\n  fish    String @db.VarChar(50)\n  kg      Float  @db.Float\n  count   Int    @default(1)\n\n  @@id([user_id, fish])\n}\n\nmodel dokku_fish_rank {\n  user_id Int    @id\n  name    String @db.Text\n  fish    String @db.Text\n  fish_kg Float  @db.Float\n  count   Int\n}\n\nmodel dokku_giftbox {\n  id          Int     @id @default(autoincrement())\n  user_id     Int\n  item        String  @default(\"\") @db.VarChar(50)\n  item_amount Int     @default(1)\n  need_item   String? @db.VarChar(50)\n  need_amount Int     @default(0)\n}\n\nmodel dokku_hottime_event {\n  id         Int      @id @default(autoincrement())\n  title      String   @default(\"\") @db.VarChar(100)\n  start_time DateTime @db.DateTime(0)\n  end_time   DateTime @db.DateTime(0)\n  reward     String   @db.LongText\n}\n\nmodel dokku_hottime_log {\n  event_id   Int\n  user_id    Int\n  claimed_at DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([user_id, event_id])\n}\n\nmodel dokku_house {\n  user_id Int    @id\n  idx     Int\n  holds   Int\n  design  Int\n  members String @default(\"{}\") @db.MediumText\n  clothes String @default(\"{}\") @db.MediumText\n}\n\nmodel dokku_incident_report {\n  report_id               Int                                @id @default(autoincrement())\n  reason                  String                             @default(\"\") @db.VarChar(255)\n  incident_description    String                             @db.Text\n  incident_time           DateTime?                          @db.DateTime(0)\n  target_user_id          Int?\n  target_user_nickname    String                             @default(\"\") @db.VarChar(100)\n  reporting_user_id       Int?\n  reporting_user_nickname String?                            @db.VarChar(100)\n  penalty_type            dokku_incident_report_penalty_type\n  warning_count           Int?\n  detention_time_minutes  Int?\n  ban_duration_hours      Int?\n  admin                   String?                            @default(\"\") @db.VarChar(100)\n}\n\nmodel dokku_jail {\n  user_id Int @id\n  time    Int @default(0)\n  admin   Int @default(0)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_limited_items {\n  item_code    String? @db.Char(50)\n  item_box     String? @db.Char(50)\n  item_current Int?    @default(0) @db.UnsignedInt\n  item_Total   Int?    @default(0)\n\n  @@ignore\n}\n\nmodel dokku_lotto_daily {\n  user_id Int     @id\n  count   Decimal @db.Decimal(10, 0)\n  name    String? @db.VarChar(50)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_lotto_list {\n  user_id    Int\n  numbers    String   @db.VarChar(50)\n  round      Int?\n  created_at DateTime @default(now()) @db.DateTime(0)\n\n  @@ignore\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_lotto_result {\n  result        String?   @db.VarChar(50)\n  user_id       Int?\n  round         Int?\n  created_at    DateTime? @db.DateTime(0)\n  entries_count Int?\n\n  @@ignore\n}\n\nmodel dokku_newbie {\n  user_id     Int       @id\n  code        String    @unique(map: \"code\") @db.VarChar(100)\n  newbieState Int       @default(0)\n  termsState  Int       @default(0)\n  created_at  DateTime? @default(now()) @db.DateTime(0)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_permission {\n  permission String? @db.Char(50)\n  key        String? @db.Char(50)\n\n  @@ignore\n}\n\nmodel dokku_quests {\n  user_id Int\n  type    String @db.VarChar(50)\n  value   String @default(\"[]\") @db.MediumText\n  step    Int    @default(1)\n  done    Int    @default(0)\n\n  @@id([type, user_id])\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_quests_calltime {\n  user_id Int\n  time    String? @db.VarChar(50)\n  type    String  @db.VarChar(50)\n\n  @@index([user_id], map: \"FK_dokku_quests_calltime_vrp_users\")\n  @@ignore\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_racing {\n  user_id Int\n  idx     Int\n  name    String @db.VarChar(50)\n  score   Int\n\n  @@index([user_id], map: \"FK_dokku_racing_vrp_users\")\n  @@ignore\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_sanctions {\n  user_id Int\n  reason  String    @db.MediumText\n  admin   String    @db.VarChar(50)\n  time    DateTime? @db.DateTime(0)\n\n  @@ignore\n}\n\nmodel dokku_skills {\n  user_id   Int  @id\n  fishing   Int? @default(0)\n  newspaper Int? @default(0)\n  mining    Int? @default(0)\n  drug      Int? @default(0)\n  hamburger Int? @default(0)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel dokku_stafflog {\n  staff_id    Int?\n  staff_name  String?   @db.Char(50)\n  target_id   Int?\n  target_name String?   @db.Char(50)\n  description String?   @db.Text\n  time        DateTime? @db.DateTime(0)\n\n  @@ignore\n}\n\nmodel dokku_tattoos {\n  user_id Int     @id\n  tattoos String? @default(\"\") @db.LongText\n}\n\nmodel dokku_tax {\n  id           Int @id @default(autoincrement())\n  statecoffers Int\n  hi           Int\n  army         Int\n}\n\nmodel dokku_tebex {\n  code        String @id @default(\"\") @db.VarChar(50)\n  packagename String @default(\"\") @db.LongText\n}\n\nmodel dokku_tebex_log {\n  id          String?   @db.Text\n  transid     String    @id @db.VarChar(255)\n  price       String?   @db.Text\n  email       String?   @db.Text\n  ip          String?   @db.Text\n  packagename String?   @db.MediumText\n  date        DateTime? @default(now()) @db.DateTime(0)\n}\n\nmodel dokku_usermarket {\n  id           Int      @id @default(autoincrement())\n  user_id      Int\n  type         String   @db.Text\n  title        String   @db.Text\n  image        String   @db.Text\n  item_name    String   @db.Text\n  item_code    String   @db.Text\n  item_type    String   @db.VarChar(255)\n  item_content String   @db.VarChar(255)\n  amount       Int\n  price        BigInt\n  sell_price   BigInt   @default(0) @db.UnsignedBigInt\n  time         DateTime @default(now()) @db.DateTime(0)\n\n  @@index([user_id], map: \"FK_memory_usedmarket_vrp_users\")\n  @@index([type(length: 768)], map: \"type\")\n}\n\nmodel dokku_warning {\n  user_id Int  @id\n  count   Int? @default(0)\n}\n\nmodel dokku_whitelist_ip {\n  id         Int       @id @default(autoincrement())\n  user_ip    String    @db.Text\n  status     Int       @default(0)\n  comment    String?   @db.VarChar(50)\n  registrant String?   @db.Text\n  date       DateTime? @default(now()) @db.DateTime(0)\n}\n\nmodel maple_tree_growth {\n  user_id                Int      @id\n  fertilizer_gauge       Int?     @default(10)\n  water_gauge            Int?     @default(10)\n  growth_gauge           Int?     @default(0)\n  fertilizer_last_update DateTime @default(now()) @db.Timestamp(0)\n  water_last_update      DateTime @default(now()) @db.Timestamp(0)\n  created_time           DateTime @default(now()) @db.Timestamp(0)\n  growth_last_update     DateTime @default(now()) @db.Timestamp(0)\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel maple_tree_log {\n  user_id         Int\n  completion_time DateTime? @default(now()) @db.DateTime(0)\n\n  @@index([user_id], map: \"FK_maple_tree_log_vrp_users\")\n  @@ignore\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel payment_history {\n  name  String?   @db.Char(50)\n  bank  String?   @db.Char(50)\n  money String?   @db.Char(50)\n  text  String?   @db.Char(255)\n  time  DateTime? @db.DateTime(0)\n\n  @@ignore\n}\n\n/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\nmodel payment_request {\n  id        String?   @db.VarChar(50)\n  type      String?   @db.VarChar(50)\n  character String?   @db.VarChar(50)\n  user_id   Int?\n  amount    Int       @default(0)\n  state     Int       @default(0)\n  time      DateTime? @db.Timestamp(0)\n\n  @@ignore\n}\n\nmodel pd_extra {\n  id         Int      @id @default(autoincrement())\n  player     String?  @default(\"0\") @db.VarChar(256)\n  tag        String?  @default(\"0\") @db.VarChar(50)\n  data       String?  @db.LongText\n  created_at DateTime @default(now()) @db.DateTime(0)\n}\n\nmodel phone_backups {\n  id           String @db.VarChar(100)\n  phone_number String @db.VarChar(15)\n\n  @@id([id, phone_number])\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_clock_alarms {\n  id           Int      @default(autoincrement()) @db.UnsignedInt\n  phone_number String   @db.VarChar(15)\n  hours        Int      @default(0)\n  minutes      Int      @default(0)\n  label        String?  @db.VarChar(50)\n  enabled      Boolean? @default(true)\n\n  @@id([id, phone_number])\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_crypto {\n  id       String @db.VarChar(100)\n  coin     String @db.VarChar(15)\n  amount   Float  @default(0)\n  invested Int    @default(0)\n\n  @@id([id, coin])\n}\n\nmodel phone_darkchat_accounts {\n  phone_number String @db.VarChar(15)\n  username     String @id @db.VarChar(20)\n  password     String @db.VarChar(100)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_darkchat_channels {\n  name String @id @db.VarChar(50)\n}\n\nmodel phone_darkchat_members {\n  channel_name String @db.VarChar(50)\n  username     String @db.VarChar(20)\n\n  @@id([channel_name, username])\n  @@index([username], map: \"username\")\n}\n\nmodel phone_darkchat_messages {\n  id        Int      @id @default(autoincrement())\n  channel   String   @db.VarChar(50)\n  sender    String   @db.VarChar(20)\n  content   String?  @db.VarChar(1000)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([channel], map: \"channel\")\n  @@index([sender], map: \"sender\")\n}\n\nmodel phone_instagram_accounts {\n  display_name    String   @db.VarChar(30)\n  username        String   @id @db.VarChar(20)\n  password        String   @db.VarChar(100)\n  profile_image   String?  @db.VarChar(500)\n  bio             String?  @db.VarChar(100)\n  post_count      Int      @default(0)\n  story_count     Int      @default(0)\n  follower_count  Int      @default(0)\n  following_count Int      @default(0)\n  phone_number    String   @db.VarChar(15)\n  private         Boolean? @default(false)\n  verified        Boolean? @default(false)\n  date_joined     DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_instagram_comments {\n  id         String   @id @db.VarChar(10)\n  post_id    String   @db.VarChar(50)\n  username   String   @db.VarChar(20)\n  comment    String   @default(\"\") @db.VarChar(500)\n  like_count Int      @default(0)\n  timestamp  DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([post_id], map: \"post_id\")\n  @@index([username], map: \"username\")\n}\n\nmodel phone_instagram_follow_requests {\n  requester String   @db.VarChar(20)\n  requestee String   @db.VarChar(20)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([requester, requestee])\n  @@index([requestee], map: \"requestee\")\n}\n\nmodel phone_instagram_follows {\n  followed String @db.VarChar(20)\n  follower String @db.VarChar(20)\n\n  @@id([followed, follower])\n  @@index([follower], map: \"follower\")\n}\n\nmodel phone_instagram_likes {\n  id         String  @db.VarChar(10)\n  username   String  @db.VarChar(20)\n  is_comment Boolean @default(false)\n\n  @@id([id, username])\n  @@index([username], map: \"username\")\n}\n\nmodel phone_instagram_messages {\n  id          String   @id @db.VarChar(10)\n  sender      String   @db.VarChar(20)\n  recipient   String   @db.VarChar(20)\n  content     String?  @db.VarChar(1000)\n  attachments String?  @db.Text\n  timestamp   DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([recipient], map: \"recipient\")\n  @@index([sender], map: \"sender\")\n}\n\nmodel phone_instagram_notifications {\n  id        String   @id @db.VarChar(10)\n  username  String   @db.VarChar(20)\n  from      String   @db.VarChar(20)\n  type      String   @db.VarChar(20)\n  post_id   String?  @db.VarChar(50)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([from], map: \"from\")\n  @@index([username], map: \"username\")\n}\n\nmodel phone_instagram_posts {\n  id            String   @id @db.VarChar(10)\n  media         String?  @db.Text\n  caption       String   @default(\"\") @db.VarChar(500)\n  location      String?  @db.VarChar(50)\n  like_count    Int      @default(0)\n  comment_count Int      @default(0)\n  username      String   @db.VarChar(20)\n  timestamp     DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([username], map: \"username\")\n}\n\nmodel phone_instagram_stories {\n  id        String   @id @db.VarChar(10)\n  username  String   @db.VarChar(20)\n  image     String   @db.VarChar(500)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([username], map: \"username\")\n}\n\nmodel phone_instagram_stories_views {\n  story_id  String   @db.VarChar(50)\n  viewer    String   @db.VarChar(20)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([story_id, viewer])\n  @@index([viewer], map: \"viewer\")\n}\n\nmodel phone_last_phone {\n  id           String @id @db.VarChar(100)\n  phone_number String @db.VarChar(15)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_logged_in_accounts {\n  phone_number String  @db.VarChar(15)\n  app          String  @db.VarChar(50)\n  username     String  @db.VarChar(100)\n  active       Boolean @default(false)\n\n  @@id([phone_number, app, username])\n}\n\nmodel phone_mail_accounts {\n  address  String @id @db.VarChar(100)\n  password String @db.VarChar(100)\n}\n\nmodel phone_mail_deleted {\n  message_id Int    @db.UnsignedInt\n  address    String @db.VarChar(100)\n\n  @@id([message_id, address])\n  @@index([address], map: \"address\")\n}\n\nmodel phone_mail_messages {\n  id          Int      @id @default(autoincrement()) @db.UnsignedInt\n  recipient   String   @db.VarChar(100)\n  sender      String   @db.VarChar(100)\n  subject     String   @db.VarChar(100)\n  content     String   @db.Text\n  attachments String?  @db.LongText\n  actions     String?  @db.LongText\n  read        Boolean  @default(false)\n  timestamp   DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_maps_locations {\n  id           Int    @id @default(autoincrement()) @db.UnsignedInt\n  phone_number String @db.VarChar(15)\n  name         String @db.VarChar(50)\n  x_pos        Float  @db.Float\n  y_pos        Float  @db.Float\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_marketplace_posts {\n  id           Int      @id @default(autoincrement())\n  phone_number String   @db.VarChar(15)\n  title        String   @db.VarChar(50)\n  description  String   @db.VarChar(1000)\n  attachments  String?  @db.Text\n  price        Int\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_message_channels {\n  id                     Int      @id @default(autoincrement())\n  is_group               Boolean  @default(false)\n  name                   String?  @db.VarChar(50)\n  last_message           String   @default(\"\") @db.VarChar(50)\n  last_message_timestamp DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_message_members {\n  channel_id   Int\n  phone_number String  @db.VarChar(15)\n  is_owner     Boolean @default(false)\n  deleted      Boolean @default(false)\n  unread       Int     @default(0)\n\n  @@id([channel_id, phone_number])\n}\n\nmodel phone_message_messages {\n  id          Int      @id @default(autoincrement())\n  channel_id  Int\n  sender      String   @db.VarChar(15)\n  content     String?  @db.VarChar(1000)\n  attachments String?  @db.Text\n  timestamp   DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([channel_id], map: \"channel_id\")\n}\n\nmodel phone_music_playlists {\n  id           Int     @id @default(autoincrement()) @db.UnsignedInt\n  phone_number String  @db.VarChar(15)\n  name         String  @db.VarChar(50)\n  cover        String? @db.VarChar(500)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_music_saved_playlists {\n  playlist_id  Int    @db.UnsignedInt\n  phone_number String @db.VarChar(15)\n\n  @@id([playlist_id, phone_number])\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_music_songs {\n  song_id     String @db.VarChar(100)\n  playlist_id Int    @db.UnsignedInt\n\n  @@id([song_id, playlist_id])\n  @@index([playlist_id], map: \"playlist_id\")\n}\n\nmodel phone_notes {\n  id           Int      @id @default(autoincrement()) @db.UnsignedInt\n  phone_number String   @db.VarChar(15)\n  title        String   @db.VarChar(50)\n  content      String?  @db.LongText\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_notifications {\n  id           Int      @id @default(autoincrement())\n  phone_number String   @db.VarChar(15)\n  app          String   @db.VarChar(50)\n  title        String?  @db.VarChar(50)\n  content      String?  @db.VarChar(500)\n  thumbnail    String?  @db.VarChar(500)\n  avatar       String?  @db.VarChar(500)\n  show_avatar  Boolean? @default(false)\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_phone_blocked_numbers {\n  phone_number   String @db.VarChar(15)\n  blocked_number String @db.VarChar(15)\n\n  @@id([phone_number, blocked_number])\n}\n\nmodel phone_phone_calls {\n  id             Int      @id @default(autoincrement()) @db.UnsignedInt\n  caller         String   @db.VarChar(15)\n  callee         String   @db.VarChar(15)\n  duration       Int      @default(0)\n  answered       Boolean? @default(false)\n  hide_caller_id Boolean? @default(false)\n  timestamp      DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_phone_contacts {\n  contact_phone_number String   @db.VarChar(15)\n  firstname            String   @default(\"\") @db.VarChar(50)\n  lastname             String   @default(\"\") @db.VarChar(50)\n  profile_image        String?  @db.VarChar(500)\n  email                String?  @db.VarChar(50)\n  address              String?  @db.VarChar(50)\n  favourite            Boolean? @default(false)\n  phone_number         String   @db.VarChar(15)\n\n  @@id([contact_phone_number, phone_number])\n}\n\nmodel phone_phone_voicemail {\n  id             Int      @id @default(autoincrement()) @db.UnsignedInt\n  caller         String   @db.VarChar(15)\n  callee         String   @db.VarChar(15)\n  url            String   @db.VarChar(500)\n  duration       Int\n  hide_caller_id Boolean? @default(false)\n  timestamp      DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_phones {\n  id           Int      @id @default(0)\n  owner_id     String   @default(\"0\") @db.VarChar(100)\n  phone_number String   @unique(map: \"phone_number\") @db.VarChar(15)\n  name         String?  @db.VarChar(50)\n  pin          String?  @db.VarChar(4)\n  face_id      String?  @db.VarChar(100)\n  settings     String?  @db.LongText\n  is_setup     Boolean? @default(false)\n  assigned     Boolean? @default(false)\n  battery      Int      @default(100)\n}\n\nmodel phone_photo_album_photos {\n  album_id Int\n  photo_id Int\n\n  @@id([album_id, photo_id])\n  @@index([photo_id], map: \"photo_id\")\n}\n\nmodel phone_photo_albums {\n  id           Int    @id @default(autoincrement())\n  phone_number String @db.VarChar(15)\n  title        String @db.VarChar(100)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_photos {\n  id           Int      @id @default(autoincrement())\n  phone_number String   @db.VarChar(15)\n  link         String   @db.VarChar(500)\n  is_video     Boolean? @default(false)\n  size         Float    @default(0) @db.Float\n  metadata     String?  @db.VarChar(20)\n  is_favourite Boolean? @default(false)\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_services_channels {\n  id           Int      @id @default(autoincrement()) @db.UnsignedInt\n  phone_number String   @db.VarChar(15)\n  company      String   @db.VarChar(50)\n  last_message String?  @db.VarChar(100)\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_services_messages {\n  id         Int      @id @default(autoincrement()) @db.UnsignedInt\n  channel_id Int      @db.UnsignedInt\n  sender     String   @db.VarChar(15)\n  message    String   @db.VarChar(1000)\n  x_pos      Int?\n  y_pos      Int?\n  timestamp  DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([channel_id], map: \"channel_id\")\n}\n\nmodel phone_tiktok_accounts {\n  name            String   @db.VarChar(30)\n  bio             String?  @db.VarChar(100)\n  avatar          String?  @db.VarChar(500)\n  username        String   @id @db.VarChar(20)\n  password        String   @db.VarChar(100)\n  verified        Boolean? @default(false)\n  follower_count  Int      @default(0)\n  following_count Int      @default(0)\n  like_count      Int      @default(0)\n  video_count     Int      @default(0)\n  twitter         String?  @db.VarChar(20)\n  instagram       String?  @db.VarChar(20)\n  show_likes      Boolean? @default(true)\n  phone_number    String   @db.VarChar(15)\n  date_joined     DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_tiktok_channels {\n  id           String   @id @db.VarChar(10)\n  last_message String   @db.VarChar(50)\n  member_1     String   @db.VarChar(20)\n  member_2     String   @db.VarChar(20)\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@unique([member_1, member_2], map: \"member_1\")\n  @@index([member_2], map: \"member_2\")\n}\n\nmodel phone_tiktok_comments {\n  id        String   @id @db.VarChar(10)\n  reply_to  String?  @db.VarChar(10)\n  video_id  String   @db.VarChar(10)\n  username  String   @db.VarChar(20)\n  comment   String   @db.VarChar(550)\n  likes     Int      @default(0)\n  replies   Int      @default(0)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([reply_to], map: \"reply_to\")\n  @@index([username], map: \"username\")\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tiktok_comments_likes {\n  username   String @db.VarChar(20)\n  comment_id String @db.VarChar(10)\n\n  @@id([username, comment_id])\n  @@index([comment_id], map: \"comment_id\")\n}\n\nmodel phone_tiktok_follows {\n  followed String @db.VarChar(20)\n  follower String @db.VarChar(20)\n\n  @@id([followed, follower])\n  @@index([follower], map: \"follower\")\n}\n\nmodel phone_tiktok_likes {\n  username String @db.VarChar(20)\n  video_id String @db.VarChar(10)\n\n  @@id([username, video_id])\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tiktok_messages {\n  id         String   @id @db.VarChar(10)\n  channel_id String   @db.VarChar(10)\n  sender     String   @db.VarChar(20)\n  content    String   @db.VarChar(500)\n  timestamp  DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([channel_id], map: \"channel_id\")\n  @@index([sender], map: \"sender\")\n}\n\nmodel phone_tiktok_notifications {\n  id         Int      @id @default(autoincrement())\n  username   String   @db.VarChar(20)\n  from       String   @db.VarChar(20)\n  type       String   @db.VarChar(20)\n  video_id   String?  @db.VarChar(10)\n  comment_id String?  @db.VarChar(10)\n  timestamp  DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([comment_id], map: \"comment_id\")\n  @@index([from], map: \"from\")\n  @@index([username], map: \"username\")\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tiktok_pinned_videos {\n  username String @db.VarChar(20)\n  video_id String @db.VarChar(10)\n\n  @@id([username, video_id])\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tiktok_saves {\n  username String @db.VarChar(20)\n  video_id String @db.VarChar(10)\n\n  @@id([username, video_id])\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tiktok_unread_messages {\n  username   String @db.VarChar(20)\n  channel_id String @db.VarChar(10)\n  amount     Int    @default(0)\n\n  @@id([username, channel_id])\n  @@index([channel_id], map: \"channel_id\")\n}\n\nmodel phone_tiktok_videos {\n  id             String   @id @db.VarChar(10)\n  username       String   @db.VarChar(20)\n  src            String   @db.VarChar(500)\n  caption        String?  @db.VarChar(100)\n  metadata       String?  @db.LongText\n  music          String?  @db.Text\n  likes          Int      @default(0)\n  comments       Int      @default(0)\n  views          Int      @default(0)\n  saves          Int      @default(0)\n  pinned_comment String?  @db.VarChar(10)\n  timestamp      DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([username], map: \"username\")\n}\n\nmodel phone_tiktok_views {\n  username String @db.VarChar(20)\n  video_id String @db.VarChar(10)\n\n  @@id([username, video_id])\n  @@index([video_id], map: \"video_id\")\n}\n\nmodel phone_tinder_accounts {\n  name             String   @db.VarChar(50)\n  phone_number     String   @id @db.VarChar(15)\n  photos           String?  @db.Text\n  bio              String?  @db.VarChar(500)\n  dob              DateTime @db.Date\n  is_male          Boolean\n  interested_men   Boolean\n  interested_women Boolean\n  active           Boolean  @default(true)\n}\n\nmodel phone_tinder_matches {\n  phone_number_1           String    @db.VarChar(15)\n  phone_number_2           String    @db.VarChar(15)\n  latest_message           String?   @db.VarChar(1000)\n  latest_message_timestamp DateTime? @db.Timestamp(0)\n\n  @@id([phone_number_1, phone_number_2])\n  @@index([phone_number_2], map: \"phone_number_2\")\n}\n\nmodel phone_tinder_messages {\n  id          Int      @id @default(autoincrement())\n  sender      String   @db.VarChar(15)\n  recipient   String   @db.VarChar(15)\n  content     String?  @db.VarChar(1000)\n  attachments String?  @db.Text\n  timestamp   DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([recipient], map: \"recipient\")\n  @@index([sender], map: \"sender\")\n}\n\nmodel phone_tinder_swipes {\n  swiper String  @db.VarChar(15)\n  swipee String  @db.VarChar(15)\n  liked  Boolean @default(false)\n\n  @@id([swiper, swipee])\n  @@index([swipee], map: \"swipee\")\n}\n\nmodel phone_twitter_accounts {\n  display_name    String   @db.VarChar(30)\n  username        String   @id @db.VarChar(20)\n  password        String   @db.VarChar(100)\n  phone_number    String   @db.VarChar(15)\n  bio             String?  @db.VarChar(100)\n  profile_image   String?  @db.VarChar(500)\n  profile_header  String?  @db.VarChar(500)\n  pinned_tweet    String?  @db.VarChar(50)\n  verified        Boolean? @default(false)\n  follower_count  Int      @default(0)\n  following_count Int      @default(0)\n  private         Boolean? @default(false)\n  date_joined     DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_twitter_follow_requests {\n  requester String   @db.VarChar(20)\n  requestee String   @db.VarChar(20)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([requester, requestee])\n  @@index([requestee], map: \"requestee\")\n}\n\nmodel phone_twitter_follows {\n  followed      String  @db.VarChar(20)\n  follower      String  @db.VarChar(20)\n  notifications Boolean @default(false)\n\n  @@id([followed, follower])\n  @@index([follower], map: \"follower\")\n}\n\nmodel phone_twitter_hashtags {\n  hashtag   String   @id @db.VarChar(50)\n  amount    Int      @default(0)\n  last_used DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel phone_twitter_likes {\n  tweet_id  String   @db.VarChar(50)\n  username  String   @db.VarChar(20)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([tweet_id, username])\n  @@index([username], map: \"username\")\n}\n\nmodel phone_twitter_messages {\n  id          String   @id @db.VarChar(10)\n  sender      String   @db.VarChar(20)\n  recipient   String   @db.VarChar(20)\n  content     String?  @db.VarChar(1000)\n  attachments String?  @db.Text\n  timestamp   DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([recipient], map: \"recipient\")\n  @@index([sender], map: \"sender\")\n}\n\nmodel phone_twitter_notifications {\n  id        String   @id @db.VarChar(10)\n  username  String   @db.VarChar(20)\n  from      String   @db.VarChar(20)\n  type      String   @db.VarChar(20)\n  tweet_id  String?  @db.VarChar(50)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([from], map: \"from\")\n  @@index([username], map: \"username\")\n}\n\nmodel phone_twitter_promoted {\n  tweet_id   String @id @db.VarChar(50)\n  promotions Int    @default(0)\n  views      Int    @default(0)\n}\n\nmodel phone_twitter_retweets {\n  tweet_id  String   @db.VarChar(50)\n  username  String   @db.VarChar(20)\n  timestamp DateTime @default(now()) @db.Timestamp(0)\n\n  @@id([tweet_id, username])\n  @@index([username], map: \"username\")\n}\n\nmodel phone_twitter_tweets {\n  id            String   @id @db.VarChar(10)\n  username      String   @db.VarChar(20)\n  content       String?  @db.VarChar(280)\n  attachments   String?  @db.Text\n  reply_to      String?  @db.VarChar(50)\n  like_count    Int?     @default(0)\n  reply_count   Int?     @default(0)\n  retweet_count Int?     @default(0)\n  timestamp     DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([username], map: \"username\")\n}\n\nmodel phone_voice_memos_recordings {\n  id           Int      @id @default(autoincrement())\n  phone_number String   @db.VarChar(15)\n  file_name    String   @db.VarChar(50)\n  file_url     String   @db.VarChar(500)\n  file_length  Int\n  created_at   DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_wallet_transactions {\n  id           Int      @id @default(autoincrement())\n  phone_number String   @db.VarChar(15)\n  amount       Int\n  company      String   @db.VarChar(50)\n  logo         String?  @db.VarChar(200)\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n\n  @@index([phone_number], map: \"phone_number\")\n}\n\nmodel phone_yellow_pages_posts {\n  id           Int      @id @default(autoincrement()) @db.UnsignedInt\n  phone_number String   @db.VarChar(15)\n  title        String   @db.VarChar(50)\n  description  String   @db.VarChar(1000)\n  attachment   String?  @db.VarChar(500)\n  price        Int?\n  timestamp    DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel user {\n  id       Int    @id @default(autoincrement())\n  username String @unique(map: \"IDX_78a916df40e02a9deb1c4b75ed\") @db.VarChar(255)\n  password String @db.VarChar(255)\n  type     String @db.VarChar(255)\n}\n\nmodel vrp_dataitem_ids {\n  id         Int      @id\n  data       String   @db.LongText\n  u_str      String?  @db.VarChar(255)\n  created_at DateTime @db.DateTime(0)\n\n  @@index([u_str], map: \"u_str\")\n}\n\nmodel vrp_srv_data {\n  dkey   String  @id @db.VarChar(100)\n  dvalue String? @db.Text\n}\n\nmodel vrp_titlebox_olduser {\n  id         Int      @id @default(autoincrement())\n  user_id    Int\n  count      Int\n  created_at DateTime @db.DateTime(0)\n\n  @@index([user_id], map: \"user_id\")\n}\n\nmodel vrp_user_data {\n  user_id         Int     @id\n  inventory       String? @db.MediumText\n  groups          String? @db.MediumText\n  weapons         String? @db.MediumText\n  health          Int?    @default(200)\n  position        String? @db.VarChar(255)\n  customization   String? @db.MediumText\n  skinitem_skinid String? @db.VarChar(255)\n  skinitem_idle   String? @db.MediumText\n  mute            Int?\n}\n\nmodel vrp_user_identities {\n  user_id      Int       @id\n  registration String?   @db.VarChar(100)\n  phone        String?   @db.VarChar(100)\n  firstname    String?   @db.VarChar(100)\n  name         String?   @db.VarChar(100)\n  age          Int?\n  car_seize    Int       @default(0)\n  first        Int?      @default(0)\n  first_join   DateTime? @db.DateTime(0)\n\n  @@index([phone], map: \"phone\")\n  @@index([registration], map: \"registration\")\n}\n\nmodel vrp_user_ids {\n  identifier String   @id @db.VarChar(100)\n  user_id    Int?\n  banned     Boolean?\n\n  @@index([user_id], map: \"FK_vrp_user_ids_vrp_users\")\n}\n\nmodel vrp_user_moneys {\n  user_id  Int     @id\n  wallet   Decimal @default(0) @db.Decimal(20, 0)\n  bank     Decimal @default(0) @db.Decimal(20, 0)\n  credit   Decimal @default(0) @db.Decimal(20, 0)\n  credit2  Decimal @default(0) @db.Decimal(20, 0)\n  exp      Decimal @default(0) @db.Decimal(20, 0)\n  drug_exp Decimal @default(0) @db.Decimal(20, 0)\n  exercise Decimal @default(0) @db.Decimal(20, 0)\n  criminal Int     @default(0)\n}\n\nmodel vrp_user_vehicles {\n  user_id       Int\n  vehicle       String  @default(\"\") @db.VarChar(100)\n  vehicle_plate String  @default(\"\") @db.VarChar(255)\n  rented        Boolean @default(false)\n  rentedid      String  @default(\"\") @db.VarChar(200)\n  rentedtime    String  @default(\"\") @db.VarChar(2048)\n  modifications String  @default(\"\") @db.Text\n\n  @@id([user_id, vehicle])\n}\n\nmodel vrp_users {\n  id          Int      @id @default(autoincrement())\n  last_login  String?  @db.VarChar(100)\n  whitelisted Boolean?\n  banned      Boolean?\n  bantime     String   @default(\"\") @db.VarChar(100)\n  banreason   String   @default(\"\") @db.VarChar(1000)\n  banadmin    String   @default(\"\") @db.VarChar(100)\n}\n\nenum dokku_incident_report_penalty_type {\n  WARNING        @map(\"경고\")\n  GAME_BAN       @map(\"게임정지\")\n  VERBAL_WARNING @map(\"구두경고\")\n  BAN_RELEASE    @map(\"정지해제\")\n}\n",
  "inlineSchemaHash": "a13e6c2d360c3ea5c4b3958b23357ce3b93f9b7ecc0e1dbfe70edefbbd3d313e",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "generated/mysql",
    "mysql",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"dokku_appearance\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"barbershop\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clothes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tattoo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_blacklist\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"phone\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_cashshop\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_cash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cumulative_cash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_coin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tier_reward\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_chunobot\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"adminName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_daily\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"joinCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_update\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_3\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_4\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_6\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_7\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_8\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_9\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_10\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_11\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_12\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_13\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_14\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_15\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_16\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_17\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_18\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_19\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_20\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_21\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_22\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_23\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_24\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_25\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_26\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_27\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"day_28\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uptime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_3\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_4\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_6\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_daily_chuseok\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"joinCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_update\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewards\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_dailycheck\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_connection_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"(curdate())\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"joinCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"today_playtime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attendance_rewards\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"{\\\"1\\\": false, \\\"2\\\": false, \\\"3\\\": false, \\\"4\\\": false, \\\"5\\\": false, \\\"6\\\": false, \\\"7\\\": false, \\\"8\\\": false, \\\"9\\\": false, \\\"10\\\": false, \\\"11\\\": false, \\\"12\\\": false, \\\"13\\\": false, \\\"14\\\": false, \\\"15\\\": false, \\\"16\\\": false, \\\"17\\\": false, \\\"18\\\": false, \\\"19\\\": false, \\\"20\\\": false, \\\"21\\\": false, \\\"22\\\": false, \\\"23\\\": false, \\\"24\\\": false, \\\"25\\\": false, \\\"26\\\": false, \\\"27\\\": false, \\\"28\\\": false, \\\"29\\\": false, \\\"30\\\": false}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time_rewards\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"{\\\"1\\\": false, \\\"2\\\": false, \\\"3\\\": false, \\\"4\\\": false, \\\"5\\\": false, \\\"6\\\": false}\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_dance\":{\"dbName\":null,\"fields\":[{\"name\":\"song_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"song_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_fish\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fish\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"kg\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"fish\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_fish_rank\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fish\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fish_kg\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_giftbox\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"need_item\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"need_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_hottime_event\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"start_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"end_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reward\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_hottime_log\":{\"dbName\":null,\"fields\":[{\"name\":\"event_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"claimed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"event_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_house\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"idx\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"holds\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"design\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"members\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clothes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_incident_report\":{\"dbName\":null,\"fields\":[{\"name\":\"report_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"incident_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"incident_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_user_nickname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reporting_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reporting_user_nickname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"penalty_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dokku_incident_report_penalty_type\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warning_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"detention_time_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ban_duration_hours\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"admin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_jail\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"admin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_lotto_daily\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_newbie\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newbieState\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"termsState\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_quests\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"done\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"type\",\"user_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_skills\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fishing\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newspaper\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mining\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"drug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hamburger\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_tattoos\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tattoos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_tax\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statecoffers\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hi\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"army\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_tebex\":{\"dbName\":null,\"fields\":[{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packagename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_tebex_log\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packagename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_usermarket\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sell_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_warning\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dokku_whitelist_ip\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registrant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"maple_tree_growth\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fertilizer_gauge\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":10,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"water_gauge\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":10,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"growth_gauge\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fertilizer_last_update\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"water_last_update\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"growth_last_update\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"pd_extra\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tag\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_backups\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"phone_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_clock_alarms\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hours\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"label\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"phone_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_crypto\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invested\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"coin\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_darkchat_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_darkchat_channels\":{\"dbName\":null,\"fields\":[{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_darkchat_members\":{\"dbName\":null,\"fields\":[{\"name\":\"channel_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"channel_name\",\"username\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_darkchat_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"display_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile_image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"post_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"story_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"following_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"private\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date_joined\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_comments\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"post_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"like_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_follow_requests\":{\"dbName\":null,\"fields\":[{\"name\":\"requester\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"requester\",\"requestee\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_follows\":{\"dbName\":null,\"fields\":[{\"name\":\"followed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"followed\",\"follower\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_likes\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"username\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_notifications\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"post_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_posts\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"media\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caption\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"like_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_stories\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_instagram_stories_views\":{\"dbName\":null,\"fields\":[{\"name\":\"story_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"story_id\",\"viewer\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_last_phone\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_logged_in_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"app\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"phone_number\",\"app\",\"username\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_mail_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_mail_deleted\":{\"dbName\":null,\"fields\":[{\"name\":\"message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"message_id\",\"address\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_mail_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"read\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_maps_locations\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"x_pos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"y_pos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_marketplace_posts\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_message_channels\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_group\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_message_timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_message_members\":{\"dbName\":null,\"fields\":[{\"name\":\"channel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_owner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unread\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"channel_id\",\"phone_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_message_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_music_playlists\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cover\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_music_saved_playlists\":{\"dbName\":null,\"fields\":[{\"name\":\"playlist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"playlist_id\",\"phone_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_music_songs\":{\"dbName\":null,\"fields\":[{\"name\":\"song_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playlist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"song_id\",\"playlist_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_notes\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_notifications\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"app\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"show_avatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_phone_blocked_numbers\":{\"dbName\":null,\"fields\":[{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blocked_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"phone_number\",\"blocked_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_phone_calls\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caller\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"callee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"answered\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hide_caller_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_phone_contacts\":{\"dbName\":null,\"fields\":[{\"name\":\"contact_phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile_image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"favourite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"contact_phone_number\",\"phone_number\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_phone_voicemail\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caller\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"callee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hide_caller_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_phones\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"owner_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"face_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"settings\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_setup\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assigned\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"battery\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":100,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_photo_album_photos\":{\"dbName\":null,\"fields\":[{\"name\":\"album_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"album_id\",\"photo_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_photo_albums\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_photos\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"link\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_video\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_favourite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_services_channels\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_services_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"x_pos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"y_pos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"following_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"like_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"twitter\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"instagram\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"show_likes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date_joined\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_channels\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"member_1\",\"member_2\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"member_1\",\"member_2\"]}],\"isGenerated\":false},\"phone_tiktok_comments\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reply_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"likes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"replies\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_comments_likes\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"comment_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_follows\":{\"dbName\":null,\"fields\":[{\"name\":\"followed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"followed\",\"follower\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_likes\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"video_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_notifications\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_pinned_videos\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"video_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_saves\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"video_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_unread_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"channel_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_videos\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"src\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caption\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"music\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"likes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"views\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"saves\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pinned_comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tiktok_views\":{\"dbName\":null,\"fields\":[{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"video_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"username\",\"video_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tinder_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dob\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_male\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interested_men\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interested_women\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tinder_matches\":{\"dbName\":null,\"fields\":[{\"name\":\"phone_number_1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number_2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latest_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latest_message_timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"phone_number_1\",\"phone_number_2\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tinder_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_tinder_swipes\":{\"dbName\":null,\"fields\":[{\"name\":\"swiper\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"swipee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"liked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"swiper\",\"swipee\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_accounts\":{\"dbName\":null,\"fields\":[{\"name\":\"display_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile_image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profile_header\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pinned_tweet\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"following_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"private\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date_joined\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_follow_requests\":{\"dbName\":null,\"fields\":[{\"name\":\"requester\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestee\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"requester\",\"requestee\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_follows\":{\"dbName\":null,\"fields\":[{\"name\":\"followed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follower\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"followed\",\"follower\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_hashtags\":{\"dbName\":null,\"fields\":[{\"name\":\"hashtag\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_used\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_likes\":{\"dbName\":null,\"fields\":[{\"name\":\"tweet_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"tweet_id\",\"username\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_messages\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_notifications\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tweet_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_promoted\":{\"dbName\":null,\"fields\":[{\"name\":\"tweet_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"promotions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"views\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_retweets\":{\"dbName\":null,\"fields\":[{\"name\":\"tweet_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"tweet_id\",\"username\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_twitter_tweets\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reply_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"like_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reply_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"retweet_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_voice_memos_recordings\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"file_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"file_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"file_length\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_wallet_transactions\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"phone_yellow_pages_posts\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_dataitem_ids\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"u_str\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_srv_data\":{\"dbName\":null,\"fields\":[{\"name\":\"dkey\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dvalue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_titlebox_olduser\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_user_data\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inventory\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"groups\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weapons\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"health\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":200,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"position\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customization\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skinitem_skinid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skinitem_idle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mute\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_user_identities\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"age\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"car_seize\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"first\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"first_join\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_user_ids\":{\"dbName\":null,\"fields\":[{\"name\":\"identifier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"banned\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_user_moneys\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wallet\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bank\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"credit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"credit2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"exp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"drug_exp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"exercise\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criminal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_user_vehicles\":{\"dbName\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicle_plate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rented\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentedid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentedtime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modifications\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"vehicle\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vrp_users\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_login\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whitelisted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"banned\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bantime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"banreason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"banadmin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"dokku_incident_report_penalty_type\":{\"values\":[{\"name\":\"WARNING\",\"dbName\":\"경고\"},{\"name\":\"GAME_BAN\",\"dbName\":\"게임정지\"},{\"name\":\"VERBAL_WARNING\",\"dbName\":\"구두경고\"},{\"name\":\"BAN_RELEASE\",\"dbName\":\"정지해제\"}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "generated/mysql/libquery_engine-darwin-arm64.dylib.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "generated/mysql/schema.prisma")
