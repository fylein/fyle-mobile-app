import { ComponentFixture } from '@angular/core/testing';

/**
 * Gets the textContent value in a component fixture using the Element object.
 *
 * @template T
 * @param element - The element in the fixture component.
 * @returns The text content of the element object.
 *
 */
export const getTextContent = <T>(element: Element): string => (element ? element.textContent.trim() : '');

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
