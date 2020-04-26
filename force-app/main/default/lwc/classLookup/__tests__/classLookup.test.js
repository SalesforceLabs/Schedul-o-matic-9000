/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createElement } from "lwc";
import ClassLookup from "c/ClassLookup";

import getClasses from "@salesforce/apex/Scheduler.getClasses";

jest.mock(
  "@salesforce/label/c.Class_input_placeholder",
  () => {
    return { default: "Search classes..." };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/Scheduler.getClasses",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

const APEX_CLASSES = [
  { value: "class1", fullName: "class1" },
  { value: "class2", fullName: "class2" },
  { value: "class3", fullName: "class3" }
];

describe("c-class-lookup", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    // Prevent data saved on mocks from leaking between tests
    jest.clearAllMocks();
  });

  // Helper function to wait until the microtask queue is empty. This is needed
  // for promise timing when calling imperative Apex.
  function flushPromises() {
    // eslint-disable-next-line no-undef
    return new Promise(resolve => setImmediate(resolve));
  }

  it("should be a-ok with no selection", async () => {
    const element = createElement("c-class-lookup", {
      is: ClassLookup
    });

    element.selectedClass = {};
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelector("input");
    expect(inputEl.placeholder).toBe("Search classes...");
  });

  it("searches for nuthin on input of fewer than 3 characters", async () => {
    jest.useFakeTimers();

    const element = createElement("c-class-lookup", {
      is: ClassLookup
    });

    element.selectedClass = {};
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelector("input");
    inputEl.value = "ba";
    inputEl.dispatchEvent(new Event("input"));

    jest.runAllTimers();

    expect(setTimeout).not.toBeCalled();
  });

  it("searches for classes on input of 3 or more characters", async () => {
    jest.useFakeTimers();
    getClasses.mockResolvedValue(APEX_CLASSES);

    const element = createElement("c-class-lookup", {
      is: ClassLookup
    });

    element.selectedClass = {};
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelector("input");
    inputEl.focus();
    inputEl.value = "baddabing";
    inputEl.dispatchEvent(new Event("input"));

    jest.runAllTimers();

    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300);
    expect(getClasses).toBeCalled();
  });

  it("should do all the things when the keys are pressed", async () => {
    const mockOptionSelectedHandler = jest.fn();
    getClasses.mockResolvedValue(APEX_CLASSES);
    jest.useFakeTimers();

    const element = createElement("c-class-lookup", {
      is: ClassLookup
    });

    element.selectedClass = {};
    element.addEventListener("optionselected", mockOptionSelectedHandler);
    document.body.appendChild(element);

    const combobox = element.shadowRoot.querySelector(".slds-combobox");
    let inputEl = element.shadowRoot.querySelector("input");
    inputEl.focus();
    const e = new Event("keydown");

    inputEl.value = "cla";
    inputEl.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    await flushPromises();

    e.keyCode = 40;
    inputEl.dispatchEvent(e);
    expect(combobox.classList).toContain("slds-is-open");

    e.keyCode = 27;
    inputEl.dispatchEvent(e);
    await Promise.resolve();
    expect(combobox.classList).not.toContain("slds-is-open");

    inputEl.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    await flushPromises();

    e.keyCode = 40;
    inputEl.dispatchEvent(e);

    e.keyCode = 40;
    inputEl.dispatchEvent(e);

    e.keyCode = 38;
    inputEl.dispatchEvent(e);

    e.keyCode = 38;
    inputEl.dispatchEvent(e);

    e.keyCode = 40;
    inputEl.dispatchEvent(e);

    e.keyCode = 40;
    inputEl.dispatchEvent(e);

    e.keyCode = 13;
    inputEl.dispatchEvent(e);

    await Promise.resolve();
    inputEl = element.shadowRoot.querySelector("input");
    expect(inputEl.value).toBe(APEX_CLASSES[1].value);
    expect(inputEl.placeholder).toBe("");
    expect(mockOptionSelectedHandler).toHaveBeenCalledTimes(1);

    let optionSelectedEvent = mockOptionSelectedHandler.mock.calls[0][0];
    expect(optionSelectedEvent.detail.value).toBe(APEX_CLASSES[1].value);

    const removeButton = element.shadowRoot.querySelector(".removeSelected");
    removeButton.click();
    await Promise.resolve();

    inputEl = element.shadowRoot.querySelector("input");
    expect(inputEl.placeholder).toBe("Search classes...");
    expect(inputEl.value).toBe("");

    jest.runAllTimers();
    expect(mockOptionSelectedHandler).toHaveBeenCalledTimes(2);

    optionSelectedEvent = mockOptionSelectedHandler.mock.calls[1][0];
    expect(optionSelectedEvent.detail.value).toBe(undefined);

    inputEl.value = "cla";
    inputEl.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    await flushPromises();

    e.keyCode = 40;
    inputEl.dispatchEvent(e);

    e.keyCode = 13;
    inputEl.dispatchEvent(e);

    await Promise.resolve();
    inputEl = element.shadowRoot.querySelector("input");
    expect(inputEl.value).toBe(APEX_CLASSES[2].value);

    e.keyCode = 46;
    inputEl.dispatchEvent(e);
    await Promise.resolve();

    inputEl = element.shadowRoot.querySelector("input");
    expect(inputEl.value).toBe("");

    jest.runAllTimers();
    expect(mockOptionSelectedHandler).toHaveBeenCalledTimes(4);

    optionSelectedEvent = mockOptionSelectedHandler.mock.calls[3][0];
    expect(optionSelectedEvent.detail.value).toBe(undefined);
  });

  it("should clear the input on click of the x", async () => {
    const element = createElement("c-class-lookup", {
      is: ClassLookup
    });

    element.selectedClass = {};
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelector("input");
    inputEl.value = "something";
    const clearButton = element.shadowRoot.querySelector(".slds-button");
    clearButton.click();

    await Promise.resolve();
    expect(inputEl.value).toBe("");
  });
});
