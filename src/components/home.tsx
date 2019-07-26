import xs, { Stream } from 'xstream';
import { VNode, DOMSource, strong } from '@cycle/dom';

import { Sources, Sinks, Reducer } from '../interfaces';

export interface State {
    count: number;
}
export const defaultState: State = {
    count: 0
};

interface DOMIntent {
    increment$: Stream<null>;
    decrement$: Stream<null>;
    link$: Stream<null>;
}

export function Home({ DOM, state }: Sources<State>): Sinks<State> {
    const { increment$, decrement$, link$ }: DOMIntent = intent(DOM);

    return {
        DOM: view(state.stream),
        state: model(increment$, decrement$),
        router: redirect(link$)
    };
}

function model(
    increment$: Stream<any>,
    decrement$: Stream<any>
): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState === undefined ? defaultState : prevState
    );

    const addToState: (n: number) => Reducer<State> = n => state => ({
        ...state,
        count: (state as State).count + n
    });
    const add$ = increment$.mapTo(addToState(1));
    const subtract$ = decrement$.mapTo(addToState(-1));

    return xs.merge(init$, add$, subtract$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ count }) => (
        <div className="centered">
            <div className="title-box">
                <strong className="title">WALKING DOWN THE SILENCE</strong>
            </div>
        </div>
    ));
}

function intent(DOM: DOMSource): DOMIntent {
    const increment$ = DOM.select('.add')
        .events('click')
        .mapTo(null);

    const decrement$ = DOM.select('.subtract')
        .events('click')
        .mapTo(null);

    const link$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo(null);

    return { increment$, decrement$, link$ };
}

function redirect(link$: Stream<any>): Stream<string> {
    return link$.mapTo('/speaker');
}
