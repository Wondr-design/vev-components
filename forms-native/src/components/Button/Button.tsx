import React from 'react';
import { registerVevComponent } from '@vev/react';
import formIcon from '../../assets/form-icon.svg';
import styles from './Button.module.css';

type Props = {
  buttonText: string;
  type: 'reset' | 'submit';
};

enum Interaction {
  UPDATE_FORM = 'UPDATE_FORM',
}

enum Event {
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  FORM_INVALID = 'FORM_INVALID',
  FORM_VALID = 'FORM_VALID',
}

function Button({ ...props }: Props) {
  const { buttonText = 'Submit', type = 'submit' } = props;

  return (
    <button className={styles.button} type={type}>
      {buttonText}
    </button>
  );
}

registerVevComponent(Button, {
  name: 'Form button',
  categories: ['Form'],
  icon: formIcon,
  editableCSS: [
    {
      selector: styles.button,
      title: 'Base',
      properties: [
        'background',
        'color',
        'border-radius',
        'box-shadow',
        'padding',
        'font-family',
        'font-size',
        'text-align',
      ],
    },
    {
      selector: styles.button + ':hover',
      title: 'Hover',
      properties: ['background', 'color', 'box-shadow'],
    },
  ],
  props: [
    {
      name: 'buttonText',
      title: 'Button text',
      type: 'string',
      initialValue: 'Submit',
    },
    {
      name: 'type',
      type: 'select',
      initialValue: 'submit',
      options: {
        items: [
          {
            value: 'submit',
            label: 'Submit',
          },
          {
            value: 'reset',
            label: 'Reset',
          },
        ],
      },
    },
  ],
  size: {
    width: 40,
    height: 100,
  },
  events: [
    {
      type: Event.FORM_SUBMITTED,
      description: 'On submitted form',
    },
    {
      type: Event.FORM_INVALID,
      description: 'On invalid form',
    },
    {
      type: Event.FORM_VALID,
      description: 'On valid form',
    },
  ],
  interactions: [
    {
      type: Interaction.UPDATE_FORM,
      description: 'Update form',
    },
  ],
});

export default Button;
