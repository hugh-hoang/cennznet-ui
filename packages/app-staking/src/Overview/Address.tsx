// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalancesMap } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { Nominators, RecentlyOfflineMap } from '../types';

import React from 'react';
import { AccountId, Balance, Option, StakingLedger } from '@polkadot/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AddressMini, AddressRow, RecentlyOffline } from '@polkadot/ui-app';
import { getAddrName } from '@polkadot/ui-app/util';
import { formatBalance } from '@polkadot/util';

import translate from '../translate';

type Props = I18nProps & {
  address: string,
  balances: DerivedBalancesMap,
  balanceArray: (_address: AccountId | string) => Array<Balance> | undefined,
  defaultName: string,
  lastAuthor: string,
  lastBlock: string,
  nominators: Nominators,
  recentlyOffline: RecentlyOfflineMap,
  session_nextKeyFor?: Option<AccountId>,
  staking_bonded?: Option<AccountId>,
  staking_ledger?: Option<StakingLedger>
};

type State = {
  controllerId: string,
  stashActive: string | null,
  stashTotal: string | null,
  stashId: string | null,
  sessionId: string | null,
  badgeExpanded: boolean;
};

class Address extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = {
      controllerId: props.address,
      sessionId: null,
      stashActive: null,
      stashTotal: null,
      stashId: null,
      badgeExpanded: false
    };
  }

  static getDerivedStateFromProps ({ session_nextKeyFor, staking_bonded, staking_ledger }: Props, prevState: State): State | null {
    const ledger = staking_ledger
      ? staking_ledger.unwrapOr(null)
      : null;
    return {
      controllerId: !staking_bonded || staking_bonded.isNone
        ? prevState.controllerId
        : staking_bonded.unwrap().toString(),
      sessionId: !session_nextKeyFor || session_nextKeyFor.isNone
        ? prevState.sessionId
        : session_nextKeyFor.unwrap().toString(),
      stashActive: !ledger
        ? prevState.stashActive
        : formatBalance(ledger.active),
      stashTotal: !ledger
        ? prevState.stashTotal
        : formatBalance(ledger.total),
      stashId: !ledger
        ? prevState.stashId
        : ledger.stash.toString()
    } as State;
  }

  render () {
    const { address, lastAuthor, lastBlock } = this.props;
    const { controllerId, stashActive, stashId } = this.state;
    const isAuthor = [address, controllerId, stashId].includes(lastAuthor);

    return (
      <article key={stashId || controllerId}>
        <AddressRow
          extraInfo={stashActive ? `bonded ${stashActive}` : undefined}
          name={this.getDisplayName()}
          value={stashId}
          withBalance={false}
          withBonded
          withCopy={false}
          withNonce={false}
        >
          {this.renderKeys()}
          {this.renderNominators()}
          {this.renderOffline()}
        </AddressRow>
        {
          isAuthor
            ? <div className='blockNumber'>#{lastBlock}</div>
            : null
        }
      </article>
    );
  }

  private getDisplayName = (): string | undefined => {
    const { defaultName } = this.props;
    const { stashId } = this.state;

    if (!stashId) {
      return defaultName;
    }

    return getAddrName(stashId) || defaultName;
  }

  private renderKeys () {
    const { t } = this.props;
    const { controllerId, sessionId } = this.state;
    const isSame = controllerId === sessionId;

    return (
      <div className='staking--accounts-info'>
        {controllerId
          ? (
            <div>
              <label className='staking--label'>{
                isSame
                  ? t('controller/session')
                  : t('controller')
              }</label>
              <AddressMini value={controllerId} />
            </div>
          )
          : null
        }
        {!isSame && sessionId
          ? (
            <div>
              <label className='staking--label'>{t('session')}</label>
              <AddressMini value={sessionId} />
            </div>
          )
          : null
        }
      </div>
    );
  }

  private renderNominators () {
    const { nominators, t } = this.props;
    const { stashId } = this.state;
    const myNominators = stashId
      ? Object.keys(nominators).filter((nominator) =>
        nominators[nominator].indexOf(stashId) !== -1
      )
      : [];

    if (!myNominators.length) {
      return null;
    }

    return (
      <details className='staking--Account-detail'>
        <summary>
          {t('Nominators ({{count}})', {
            replace: {
              count: myNominators.length
            }
          })}
        </summary>
        {myNominators.map((accountId) =>
          <AddressMini
            key={accountId.toString()}
            value={accountId}
            withBonded
          />
        )}
      </details>
    );
  }

  private renderOffline () {
    const { recentlyOffline } = this.props;
    const { stashId } = this.state;

    if (!stashId || !recentlyOffline[stashId]) {
      return null;
    }

    const offline = recentlyOffline[stashId];

    return (
      <RecentlyOffline
        accountId={stashId}
        offline={offline}
        tooltip
      />
    );
  }
}

export default withMulti(
  Address,
  translate,
  withCalls<Props>(
    ['query.session.nextKeyFor', { paramName: 'address' }],
    ['query.staking.ledger', { paramName: 'address' }],
    ['query.staking.bonded', { paramName: 'address' }]
  )
);