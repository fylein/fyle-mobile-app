import { ElementRef } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Gets the textContent value in a component fixture using the Element object.
 *
 * @template T
 * @param element - The element in the fixture component.
 * @returns The text content of the element object.
 *
 */
export const getTextContent = <T>(element: Element): string => element.textContent.trim();

/**
 * Finds an element in a component fixture using its query selector.
 *
 * @template T
 * @param fixture - The component fixture to search in.
 * @param selector - The query selector of the element to find.
 * @returns The found element represented as an Element object.
 *
 */
export const getElementBySelector = <T>(fixture: ComponentFixture<T>, selector: string): Element =>
  fixture.nativeElement.querySelector(selector);

/**
 * Finds all elements in a component fixture using their query selector.
 *
 * @template T
 * @param fixture - The component fixture to search in.
 * @param selector - The query selector of the elements to find.
 * @returns The found elements represented as an array of Element objects.
 *
 */
export const getAllElementsBySelector = <T>(fixture: ComponentFixture<T>, selector: string): Element[] =>
  fixture.nativeElement.querySelectorAll(selector);

/**
 * Gets an attribute value in a component fixture using DebugElement object.
 *
 * @template T
 * @param element - The Element in the fixture component.
 * @param attributeName - The tag name of the element to find. for e.g. <p>, <h1>
 * @returns The attribute value of the Element object.
 *
 */
export const getElementAttributeValue = (element: Element, attributeName: string): string =>
  element.getAttribute(attributeName);

export const click = (element: HTMLElement): void => element.click();

/**
 * Finds an element in a component fixture using its tag name.
 *
 * @template T
 * @param fixture - The component fixture to search in.
 * @param tagName - The tag name of the element to find. for e.g. <p>, <h1>
 * @returns The found element represented as an Element object.
 *
 */
export const getElementByTagName = <T>(fixture: ComponentFixture<T>, tagName: string): Element =>
  fixture.nativeElement.querySelector(tagName);

/**
 * Finds an element reference in a component fixture using its query selector.
 *
 * @template T
 * @param fixture - The component fixture to search in.
 * @param selector - The query selector of the elements to find.
 * @returns The found element reference represented as an ElementRef object.
 *
 */
export const getElementRef = <T>(fixture: ComponentFixture<T>, selector: string): ElementRef =>
  fixture.debugElement.query(By.css(selector));
