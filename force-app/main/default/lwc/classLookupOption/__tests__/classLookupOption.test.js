/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createElement } from "lwc";
import ClassLookupOption from "c/ClassLookupOption";

jest.mock(
  "@salesforce/label/c.Class_type_Schedulable",
  () => {
    return { default: "Schedulable" };
  },
  { virtual: true }
);

const ITEM = {
  value: "baddabing",
  label: "baddabing",
  pre: "bad",
  mark: "da",
  post: "bing",
  schedulable: "true"
};

const ACTIVE_OPTION = "baddabing";

describe("c-class-lookup-option", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("shows class name and appropriate icon based on public property", () => {
    const element = createElement("c-class-lookup-option", {
      is: ClassLookupOption
    });

    element.item = ITEM;
    document.body.appendChild(element);

    const iconEl = element.shadowRoot.querySelector("lightning-icon");
    expect(iconEl.iconName).toBe("utility:clock");
    expect(iconEl.alternativeText).toBe("Schedulable");

    const spanEl = element.shadowRoot.querySelector(".apexClassName");
    expect(spanEl.title).toBe(ITEM.label);
    expect(spanEl.textContent).toBe(ITEM.label);

    const markEl = element.shadowRoot.querySelector("mark");
    expect(markEl.textContent).toBe(ITEM.mark);

    const divEl = element.shadowRoot.querySelector("div");
    expect(divEl.classList).not.toContain("slds-has-focus");
    expect(divEl.ariaSelected).toBe("false");
  });

  it("fires optionselected event when clicked", async () => {
    const mockOptionSelectedHandler = jest.fn();

    const element = createElement("c-class-lookup-option", {
      is: ClassLookupOption
    });

    element.item = ITEM;
    element.addEventListener("optionselected", mockOptionSelectedHandler);
    document.body.appendChild(element);

    const divEl = element.shadowRoot.querySelector("div");
    divEl.click();

    expect(mockOptionSelectedHandler).toHaveBeenCalledTimes(1);

    const optionSelectedEvent = mockOptionSelectedHandler.mock.calls[0][0];
    expect(optionSelectedEvent.detail).toBe(ITEM.value);
  });

  it("activates/deactivates on mouse enter/leave", async () => {
    const mockOptionActivatedHandler = jest.fn();

    const element = createElement("c-class-lookup-option", {
      is: ClassLookupOption
    });

    element.item = ITEM;
    element.addEventListener("optionactivated", mockOptionActivatedHandler);
    document.body.appendChild(element);

    const divEl = element.shadowRoot.querySelector("div");
    divEl.dispatchEvent(new Event("mouseenter"));
    expect(mockOptionActivatedHandler).toHaveBeenCalledTimes(1);

    const optionActivatedEvent = mockOptionActivatedHandler.mock.calls[0][0];
    expect(optionActivatedEvent.detail).toBe(ITEM.value);

    await Promise.resolve();
    expect(divEl.classList).toContain("slds-has-focus");
    expect(divEl.ariaSelected).toBe("true");

    divEl.dispatchEvent(new Event("mouseleave"));
    await Promise.resolve();
    expect(divEl.classList).not.toContain("slds-has-focus");
    expect(divEl.ariaSelected).toBe("false");
  });

  it("shows focused option and activated aria if active option matches item", () => {
    const element = createElement("c-class-lookup-option", {
      is: ClassLookupOption
    });

    element.item = ITEM;
    element.activeOption = ACTIVE_OPTION;
    document.body.appendChild(element);

    const divEl = element.shadowRoot.querySelector("div");
    expect(divEl.classList).toContain("slds-has-focus");
    expect(divEl.ariaSelected).toBe("true");
  });
});
