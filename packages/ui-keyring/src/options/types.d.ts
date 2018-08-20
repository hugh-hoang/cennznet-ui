// Copyright 2017-2018 @polkadot/ui-keyring authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

export type KeyringSectionOption = {
  className?: string,
  disabled?: boolean,
  content?: any | string, // node?
  key: string | null,
  name: string,
  text: any | string, // node?
  value: string | null
};

export type KeyringOptionsSection = Array<KeyringSectionOption>;

export type KeyringOptions  = {
  account: KeyringOptionsSection,
  address: KeyringOptionsSection,
  all: KeyringOptionsSection,
  recent: KeyringOptionsSection,
  testing: KeyringOptionsSection
}

export type KeyringOption$Type = keyof KeyringOptions;
