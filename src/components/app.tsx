import xs, { Stream } from 'xstream';
import { extractSinks } from 'cyclejs-utils';
import isolate from '@cycle/isolate';

import { driverNames } from '../drivers';
import { Sources, Sinks, Component } from '../interfaces';

import { Home, State as CounterState } from './home';
import { Speaker, State as SpeakerState } from './speaker';

export interface State {
    counter?: CounterState;
    speaker?: SpeakerState;
}

export function App(sources: Sources<State>): Sinks<State> {
    const match$ = sources.router.define({
        '/home': isolate(Home, 'home'),
        '/speaker': isolate(Speaker, 'speaker')
    });

    const componentSinks$: Stream<Sinks<State>> = match$
        .filter(({ path, value }: any) => path && typeof value === 'function')
        .map(({ path, value }: { path: string; value: Component<any> }) => {
            return value({
                ...sources,
                router: sources.router.path(path)
            });
        });

    const redirect$: Stream<string> = sources.router.history$
        .filter((l: Location) => l.pathname === '/')
        .mapTo('/home');

    const sinks = extractSinks(componentSinks$, driverNames);
    return {
        ...sinks,
        router: xs.merge(redirect$, sinks.router)
    };
}
