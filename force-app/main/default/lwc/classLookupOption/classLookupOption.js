/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api } from "lwc";

import labels from "./labels";

export default class ClassLookupOption extends LightningElement {
  label = labels;

  @api item;
  @api activeOption;
  isActive = false;

  get ariaSelectedClass() {
    return this.isActive || this.activeOption === this.item.value
      ? "true"
      : "false";
  }

  get optionClass() {
    return `slds-media slds-listbox__option slds-listbox__option_plain slds-media_small ${
      this.isActive || this.activeOption === this.item.value
        ? "slds-has-focus"
        : ""
    }`;
  }

  handleClick() {
    this.dispatchEvent(
      new CustomEvent("optionselected", { detail: this.item.value })
    );
  }

  handleMouseEnter() {
    this.isActive = true;
    this.dispatchEvent(
      new CustomEvent("optionactivated", { detail: this.item.value })
    );
  }

  handleMouseLeave() {
    this.isActive = false;
  }
}
