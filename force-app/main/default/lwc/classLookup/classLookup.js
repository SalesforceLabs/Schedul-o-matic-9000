/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api } from "lwc";

import { showToast } from "c/schedulerUtils";

import CLIENT_FORM_FACTOR from "@salesforce/client/formFactor";
import getClasses from "@salesforce/apex/Scheduler.getClasses";

import labels from "./labels";

const DELAY = 300;
const INPUT_FOR_ID_SELECTED = "class-selected-combobox";
const INPUT_FOR_ID_NOT_SELECTED = "class-not-selected-combobox";

const UP_ARROW = 38;
const DOWN_ARROW = 40;
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const DELETE_KEY = 46;
const BACKSPACE_KEY = 8;

export default class ClassLookup extends LightningElement {
  formFactor = CLIENT_FORM_FACTOR;
  label = labels;

  @api
  get selectedClass() {
    return this.selectedOption;
  }

  set selectedClass(value) {
    this.selectedOption = value;
  }

  selectedOption;
  showOptions;
  searchOptions = [];
  hasFocus = false;
  searchTerm = "";
  searching = false;
  timer;
  activeOption;
  inputForId = INPUT_FOR_ID_NOT_SELECTED;

  get hasSelectionClass() {
    return `slds-combobox_container ${
      this.selectedOption.value ? "slds-has-selection" : ""
    }`;
  }

  get showOptionsClass() {
    return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${
      this.showOptions && this.searchOptions.length > 0 ? "slds-is-open" : ""
    }`;
  }

  get ariaExpandedShowOptionsClass() {
    return this.showOptions && this.searchOptions.length > 0;
  }

  get iconClass() {
    return `slds-combobox__form-element slds-input-has-icon ${
      this.selectedOption.value
        ? "slds-input-has-icon_left-right"
        : "slds-input-has-icon_right"
    }`;
  }

  get noSelectedOptionClass() {
    return `slds-input slds-combobox__input slds-combobox__input-value ${
      this.hasFocus ? "slds-has-focus" : ""
    }`;
  }

  get searchSpinnerClass() {
    return `slds-spinner slds-spinner_brand slds-spinner_x-small slds-input__spinner${
      this.searching ? "" : " slds-hide"
    }`;
  }

  get clearButtonClass() {
    return `slds-button slds-button_icon slds-input__icon slds-input__icon_right${
      this.searchTerm ? "" : " slds-hide"
    }`;
  }

  handleOnFocus() {
    this.showOptions = true;
    this.hasFocus = true;
    this.template
      .querySelector(".listbox")
      .addEventListener("mousedown", this.listenForMousedown);
  }

  handleInput(event) {
    this.searchTerm = event.target.value;
    window.clearTimeout(this.timer);

    if (!this.searchTerm || this.searchTerm.length < 3) {
      this.timer = null;
      this.searchOptions = [];
      this.activeOption = "";
      this.showOptions = true;

      return;
    }

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timer = setTimeout(() => {
      this.fireLookupSearch();
    }, DELAY);
  }

  handleOnBlur() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const lookupContainer = this.template.querySelector(".lookup-container");

      if (!lookupContainer.contains(document.activeElement)) {
        this.showOptions = false;
        this.hasFocus = false;
        this.removeActivedescendant();

        this.template
          .querySelector(".listbox")
          .removeEventListener("mousedown", this.listenForMousedown);
      }
    });
  }

  handleKeyDown(event) {
    const upPressed = event.keyCode === UP_ARROW;
    const downPressed = event.keyCode === DOWN_ARROW;
    const enterPressed = event.keyCode === ENTER_KEY;
    const escapePressed = event.keyCode === ESCAPE_KEY;

    const activeOptionIdx = this.searchOptions.reduce(
      (acc, cur, idx) => (cur.value === this.activeOption ? idx : acc),
      null
    );
    const lastPossibleIdx = this.searchOptions.length - 1;
    const firstOption = this.searchOptions[0];
    const lastOption = this.searchOptions[lastPossibleIdx];
    const noActiveOption = activeOptionIdx === null;
    const firstOptionActive = activeOptionIdx === 0;
    const lastOptionActive = activeOptionIdx === lastPossibleIdx;
    let nextActiveOption;

    if (upPressed) {
      // required else pressing the "up" arrow will move the cursor to the start
      // of the input field
      event.preventDefault();
    }

    if (
      (upPressed || downPressed) &&
      (!this.searchOptions || !this.searchOptions.length)
    ) {
      // nothing to see, don't try to update the nextActiveOption or it will gack
      return;
    }

    if (!escapePressed && !this.showOptions) {
      this.showOptions = true;
    }

    if (upPressed && noActiveOption) {
      nextActiveOption = lastOption.value;
    } else if (downPressed && noActiveOption) {
      nextActiveOption = this.searchOptions[0].value;
    } else if (upPressed && firstOptionActive) {
      nextActiveOption = lastOption.value;
      const optionsList = this.template.querySelector(".slds-listbox");
      const optionsListBottom = optionsList.getBoundingClientRect().bottom;
      this.updateDropdownScrollTop(optionsListBottom);
    } else if (downPressed && lastOptionActive) {
      nextActiveOption = firstOption.value;
      this.updateDropdownScrollTop(0);
    } else if (upPressed) {
      nextActiveOption = this.searchOptions[activeOptionIdx - 1].value;
    } else if (downPressed) {
      nextActiveOption = this.searchOptions[activeOptionIdx + 1].value;
    } else if (enterPressed) {
      this.selectOption();
    } else if (escapePressed) {
      this.timer = null;
      this.searchOptions = [];
      this.showOptions = false;
      this.activeOption = "";
      this.removeActivedescendant();
    }

    if (nextActiveOption) {
      this.activeOption = nextActiveOption;
      this.updateActivedescendant();
      this.updateContainerScrollIfNeeded(nextActiveOption);
    }
  }

  async fireLookupSearch() {
    this.searching = true;
    try {
      this.searchOptions = await getClasses({ searchTerm: this.searchTerm });
    } catch (e) {
      showToast(
        this,
        "Error",
        e.body ? e.body.message : e.message,
        "error",
        "sticky"
      );
    } finally {
      this.searching = false;
    }
  }

  listenForMousedown(e) {
    // don't trigger blur if scrollbar receives mousedown event
    e.preventDefault();
  }

  updateContainerScrollIfNeeded(val) {
    const optionsListClass = ".slds-listbox";
    const containerClass = ".listbox";

    if (
      !this.template.querySelector(optionsListClass) ||
      !this.template.querySelector(containerClass)
    ) {
      return;
    }

    const container = this.template.querySelector(containerClass);
    const containerBounds = container.getBoundingClientRect();
    const containerTop = containerBounds.top;
    const containerBottom = containerBounds.bottom;

    const queryForActiveOption = `[data-option="${val}"]`;
    const optionsList = this.template.querySelector(optionsListClass);
    const activeOption = optionsList.querySelector(queryForActiveOption);
    if (!activeOption) {
      return;
    }
    const activeOptionBounds = activeOption.getBoundingClientRect();
    const activeOptionTop = activeOptionBounds.top;
    const activeOptionBottom = activeOptionBounds.bottom;
    const activeOptionHeight = activeOptionBounds.height;

    const optionBelowFieldOfView = containerBottom < activeOptionBottom;
    const optionAboveFieldOfView = containerTop > activeOptionTop;

    if (optionBelowFieldOfView) {
      const updatedScrollTop = container.scrollTop + activeOptionHeight;
      this.updateDropdownScrollTop(updatedScrollTop);
    } else if (optionAboveFieldOfView) {
      const updatedScrollTop = container.scrollTop - activeOptionHeight;
      this.updateDropdownScrollTop(updatedScrollTop);
    }
  }

  updateDropdownScrollTop(updatedTop) {
    const container = this.template.querySelector(".listbox");
    if (!container) {
      return;
    }

    container.scrollTop = updatedTop;
  }

  handleOptionSelected(event) {
    this.handleOptionActivated(event);
    this.selectOption();
  }

  handleOptionActivated(event) {
    this.activeOption = event.detail;
    this.updateActivedescendant();
  }

  updateActivedescendant() {
    const el = this.template.querySelector(
      `[data-option="${this.activeOption}"]`
    );
    if (el && el.id) {
      this.template
        .querySelector("input")
        .setAttribute("aria-activedescendant", el.id);
    }
  }

  removeActivedescendant() {
    this.template
      .querySelector("input")
      .setAttribute("aria-activedescendant", "");
  }

  selectOption() {
    const selectedValue = this.activeOption;
    const onlyMatchingOptions = this.searchOptions.filter(
      option => option.value === selectedValue
    );
    this.selectedOption = onlyMatchingOptions[0];
    this.searchOptions = [];
    this.showOptions = false;
    this.inputForId = INPUT_FOR_ID_SELECTED;
    this.searchTerm = "";
    this.fireLookupOptionSelected();
  }

  fireLookupOptionSelected() {
    const updateEvent = new CustomEvent("optionselected", {
      detail: {
        value: this.selectedOption.fullName,
        batchable: this.selectedOption.batchable,
        schedulable: this.selectedOption.schedulable
      }
    });
    this.dispatchEvent(updateEvent);
  }

  handleClearInput() {
    this.searchTerm = "";
    this.searchOptions = [];
    const input = this.template.querySelector(".slds-input");
    if (input) {
      input.focus();
    }
  }

  handleReadonlyKeydown(event) {
    if (event.keyCode === DELETE_KEY || event.keyCode === BACKSPACE_KEY) {
      this.handleRemove();
    }
  }

  handleRemove() {
    this.selectedOption = {};
    this.showOptions = false;
    this.inputForId = INPUT_FOR_ID_NOT_SELECTED;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const input = this.template.querySelector(".slds-input");
      if (input) {
        input.focus();
      }
      this.fireLookupOptionSelected();
    });
  }
}
