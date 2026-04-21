export type PetOsEventName =
  | 'daily_login'
  | 'long_absence'
  | 'life_critical'
  | 'status_change_off_duty'
  | 'status_change_overtime'
  | 'touch_fish'
  | 'drink_coffee'
  | 'artifact_saved';

export type PetPosture =
  | 'idle'
  | 'awake'
  | 'quiet'
  | 'rest'
  | 'working'
  | 'alert'
  | 'pause'
  | 'recover'
  | 'focused';

export type PetMoodTint =
  | 'slate'
  | 'blue'
  | 'pink'
  | 'green'
  | 'amber';
