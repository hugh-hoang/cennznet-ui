// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { TranslationFunction } from 'i18next';
import { TypeDef } from '@polkadot/types/codec';
import { Props as BareProps, RawParam } from '../types';

import React from 'react';
import { Button } from '@polkadot/ui-app/index';

import translate from '../../translate';
import getInitValue from '../initValue';
import Bare from './Bare';
import findComponent from './findComponent';

type Props = BareProps & {
  t: TranslationFunction
};

type State = {
  Component: React.ComponentType<BareProps> | null,
  type?: string,
  values: Array<RawParam>
};

class Vector extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      Component: null,
      values: []
    };
  }

  static getDerivedStateFromProps ({ defaultValue: { value = [] }, type: { sub, type } }: Props, prevState: State): Partial<State> | null {
    if (type === prevState.type) {
      return null;
    }

    return {
      Component: findComponent(sub as TypeDef),
      type,
      values: prevState.values.length === 0
        ? value
        : prevState.values
    };
  }

  render () {
    const { className, isDisabled, style, t, type, withLabel } = this.props;
    const { Component, values } = this.state;

    if (!Component) {
      return null;
    }

    const subType = type.sub as TypeDef;

    return (
      <Bare
        className={className}
        style={style}
      >
        {values.map((value, index) => (
          <Component
            defaultValue={value}
            isDisabled={isDisabled}
            label={`${index}: ${subType.type}`}
            onChange={this.onChange(index)}
            type={subType}
            withLabel={withLabel}
          />
        ))}
        <div className='ui--Param-Vector-buttons'>
          <Button
            icon='plus'
            isPrimary
            onClick={this.rowAdd}
            text={t('vector.add', {
              defaultValue: 'add item'
            })}
          />
          <Button
            icon='minus'
            isDisabled={values.length === 1}
            isNegative
            onClick={this.rowRemove}
            text={t('vector.remove', {
              defaultValue: 'remove item'
            })}
          />
        </div>
      </Bare>
    );
  }

  private onChange = (index: number) => {
    const { onChange } = this.props;

    return (value: RawParam): void => {
      let isValid = value.isValid;
      const values = this.state.values.map((svalue, sindex) => {
        if (sindex === index) {
          return value;
        }

        isValid = isValid && svalue.isValid;

        return svalue;
      });

      this.setState({ values }, () => {
        onChange && onChange({
          isValid,
          value: values.map(({ value }) => value)
        });
      });
    };
  }

  private rowAdd = (): void => {
    const { type } = this.props;
    const { values } = this.state;

    this.setState({
      values: values.concat(getInitValue(type))
    });
  }

  private rowRemove = (): void => {
    const { values } = this.state;

    this.setState({
      values: values.slice(0, values.length - 1)
    });
  }
}

// @ts-ignore Definitions seem to have gone wonky
export default translate(Vector);