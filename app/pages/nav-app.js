
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const createNavStore = () => {
        const { subscribe, set, update } = writable ({
            leftover: 'LEFTOVERZZ',        
            albums: []
        });

        let STORE;
        subscribe(store => STORE = store);


        const updateMeta = newStuff => {
            const updated = {
                ...STORE,
                ...newStuff
            };

            set(updated);

            console.log('STORE updateMeta', newStuff);
        };

        return {
            subscribe,
            set,
            update,

            updateMeta
        };
    };



    const NavStore = createNavStore();

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.31.0 */

    const file = "node_modules\\svelte-icons\\components\\IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconBase", slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\md\MdArrowDropUp.svelte generated by Svelte v3.31.0 */
    const file$1 = "node_modules\\svelte-icons\\md\\MdArrowDropUp.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7 14l5-5 5 5z");
    			add_location(path, file$1, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdArrowDropUp", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdArrowDropUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdArrowDropUp",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdArrowDropDown.svelte generated by Svelte v3.31.0 */
    const file$2 = "node_modules\\svelte-icons\\md\\MdArrowDropDown.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7 10l5 5 5-5z");
    			add_location(path, file$2, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdArrowDropDown", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdArrowDropDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdArrowDropDown",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* templates\components\accordion\AccordionHeader.svelte generated by Svelte v3.31.0 */
    const file$3 = "templates\\components\\accordion\\AccordionHeader.svelte";

    // (19:4) {:else}
    function create_else_block(ctx) {
    	let mdarrowdropdown;
    	let current;
    	mdarrowdropdown = new MdArrowDropDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdarrowdropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdarrowdropdown, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdarrowdropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdarrowdropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdarrowdropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if open}
    function create_if_block$1(ctx) {
    	let mdarrowdropup;
    	let current;
    	mdarrowdropup = new MdArrowDropUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdarrowdropup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdarrowdropup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdarrowdropup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdarrowdropup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdarrowdropup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:4) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*open*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if_block.c();
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$3, 15, 4, 431);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*localClass*/ ctx[2]) + " svelte-1akt17k"));
    			add_location(div1, file$3, 14, 0, 393);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			if (!current || dirty & /*localClass*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*localClass*/ ctx[2]) + " svelte-1akt17k"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AccordionHeader", slots, []);
    	let { title = undefined } = $$props;
    	let { open = undefined } = $$props;
    	let { className = "" } = $$props;
    	const writable_props = ["title", "open", "className"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AccordionHeader> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    	};

    	$$self.$capture_state = () => ({
    		MdArrowDropUp,
    		MdArrowDropDown,
    		title,
    		open,
    		className,
    		localClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("localClass" in $$props) $$invalidate(2, localClass = $$props.localClass);
    	};

    	let localClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open, className*/ 10) {
    			 $$invalidate(2, localClass = "accordion-section__header" + (open ? " open" : "") + (className ? " " + className : ""));
    		}
    	};

    	return [title, open, localClass, className, click_handler];
    }

    class AccordionHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, open: 1, className: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionHeader",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get title() {
    		throw new Error("<AccordionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<AccordionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<AccordionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<AccordionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<AccordionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<AccordionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\accordion\AccordionSection.svelte generated by Svelte v3.31.0 */
    const file$4 = "templates\\components\\accordion\\AccordionSection.svelte";

    // (24:4) {#if open}
    function create_if_block$2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "accordion-body");
    			add_location(div, file$4, 24, 8, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(24:4) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let li;
    	let header;
    	let t;
    	let li_classname_value;
    	let current;

    	header = new AccordionHeader({
    			props: {
    				title: /*title*/ ctx[2],
    				open: /*open*/ ctx[1]
    			},
    			$$inline: true
    		});

    	header.$on("click", function () {
    		if (is_function(/*handleChange*/ ctx[4].bind(null, /*key*/ ctx[0]))) /*handleChange*/ ctx[4].bind(null, /*key*/ ctx[0]).apply(this, arguments);
    	});

    	let if_block = /*open*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(header.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(li, "classname", li_classname_value = `accordion-section ${/*className*/ ctx[3]}`);
    			add_location(li, file$4, 21, 0, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(header, li, null);
    			append_dev(li, t);
    			if (if_block) if_block.m(li, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const header_changes = {};
    			if (dirty & /*title*/ 4) header_changes.title = /*title*/ ctx[2];
    			if (dirty & /*open*/ 2) header_changes.open = /*open*/ ctx[1];
    			header.$set(header_changes);

    			if (/*open*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*className*/ 8 && li_classname_value !== (li_classname_value = `accordion-section ${/*className*/ ctx[3]}`)) {
    				attr_dev(li, "classname", li_classname_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(header);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ACCORDION = {};

    function instance$4($$self, $$props, $$invalidate) {
    	let $selected;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AccordionSection", slots, ['default']);
    	let { title = undefined } = $$props;
    	let { open = false } = $$props;
    	let { className = "" } = $$props;
    	let { key } = $$props;
    	const { handleChange, selected } = getContext(ACCORDION);
    	validate_store(selected, "selected");
    	component_subscribe($$self, selected, value => $$invalidate(6, $selected = value));
    	const writable_props = ["title", "open", "className", "key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AccordionSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ACCORDION,
    		getContext,
    		slide,
    		Header: AccordionHeader,
    		title,
    		open,
    		className,
    		key,
    		handleChange,
    		selected,
    		$selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key, title*/ 5) {
    			 $$invalidate(0, key = key || title);
    		}

    		if ($$self.$$.dirty & /*$selected, key*/ 65) {
    			//get selected value from context
    			 $$invalidate(1, open = $selected === key);
    		}
    	};

    	return [key, open, title, className, handleChange, selected, $selected, $$scope, slots];
    }

    class AccordionSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 2, open: 1, className: 3, key: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccordionSection",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<AccordionSection> was created without expected prop 'key'");
    		}
    	}

    	get title() {
    		throw new Error("<AccordionSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<AccordionSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<AccordionSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<AccordionSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<AccordionSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<AccordionSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<AccordionSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<AccordionSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\accordion\Accordion.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file$5 = "templates\\components\\accordion\\Accordion.svelte";

    function create_fragment$5(ctx) {
    	let ul;
    	let ul_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "class", ul_class_value = "" + (null_to_empty(`accordion ${/*className*/ ctx[0]}`) + " svelte-krbn3g"));
    			add_location(ul, file$5, 54, 0, 1160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*className*/ 1 && ul_class_value !== (ul_class_value = "" + (null_to_empty(`accordion ${/*className*/ ctx[0]}`) + " svelte-krbn3g"))) {
    				attr_dev(ul, "class", ul_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $selected;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Accordion", slots, ['default']);
    	const selected = writable(null);
    	validate_store(selected, "selected");
    	component_subscribe($$self, selected, value => $$invalidate(7, $selected = value));
    	let { value = undefined } = $$props;
    	let { className = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	let currentValue = "";

    	const handleChange = function (newValue) {
    		console.log("handleChange", newValue);

    		if (!isControlled) {
    			if (newValue === $selected) {
    				selected.set("");
    			} else {
    				selected.set(newValue);
    			}
    		}

    		if (newValue === currentValue) {
    			currentValue = "";
    			dispatch("change", "");
    		} else {
    			dispatch("change", newValue);
    		}
    	};

    	setContext(ACCORDION, { handleChange, selected });
    	const writable_props = ["value", "className"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Accordion> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		setContext,
    		writable,
    		ACCORDION,
    		selected,
    		value,
    		className,
    		dispatch,
    		currentValue,
    		handleChange,
    		isControlled,
    		$selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("currentValue" in $$props) currentValue = $$props.currentValue;
    		if ("isControlled" in $$props) $$invalidate(3, isControlled = $$props.isControlled);
    	};

    	let isControlled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 4) {
    			 $$invalidate(3, isControlled = typeof value !== "undefined");
    		}

    		if ($$self.$$.dirty & /*isControlled, value*/ 12) {
    			 if (isControlled) {
    				selected.set(value);
    			}
    		}
    	};

    	return [className, selected, value, isControlled, $$scope, slots];
    }

    class Accordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 2, className: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordion",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get value() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Accordion.Section=AccordionSection;
    Accordion.Header=AccordionHeader;

    /* templates\components\nav\NavItem.svelte generated by Svelte v3.31.0 */

    const file$6 = "templates\\components\\nav\\NavItem.svelte";

    // (14:4) {#if item.subtitle_A}
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[0].subtitle_A + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "nav-subtitle A");
    			add_location(div, file$6, 14, 8, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].subtitle_A + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(14:4) {#if item.subtitle_A}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if item.subtitle_B}
    function create_if_block$3(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[0].subtitle_B + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "nav-subtitle B");
    			add_location(div, file$6, 18, 8, 575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].subtitle_B + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(18:4) {#if item.subtitle_B}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let a;
    	let div;
    	let t0_value = (/*custom*/ ctx[1].title || /*item*/ ctx[0].title) + "";
    	let t0;
    	let t1;
    	let t2;
    	let a_class_value;
    	let a_href_value;
    	let a_title_value;
    	let if_block0 = /*item*/ ctx[0].subtitle_A && create_if_block_1(ctx);
    	let if_block1 = /*item*/ ctx[0].subtitle_B && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "nav-title svelte-15mdz08");
    			add_location(div, file$6, 11, 4, 378);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty("nav-item" + (/*custom*/ ctx[1].className
    			? " " + /*custom*/ ctx[1].className
    			: "")) + " svelte-15mdz08"));

    			attr_dev(a, "href", a_href_value = /*custom*/ ctx[1].noLink
    			? ""
    			: /*custom*/ ctx[1].url || /*item*/ ctx[0].url);

    			attr_dev(a, "title", a_title_value = /*custom*/ ctx[1].title
    			? /*custom*/ ctx[1].title
    			: "/" + /*item*/ ctx[0].url);

    			add_location(a, file$6, 7, 0, 183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, t0);
    			append_dev(a, t1);
    			if (if_block0) if_block0.m(a, null);
    			append_dev(a, t2);
    			if (if_block1) if_block1.m(a, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*custom, item*/ 3 && t0_value !== (t0_value = (/*custom*/ ctx[1].title || /*item*/ ctx[0].title) + "")) set_data_dev(t0, t0_value);

    			if (/*item*/ ctx[0].subtitle_A) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(a, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[0].subtitle_B) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*custom*/ 2 && a_class_value !== (a_class_value = "" + (null_to_empty("nav-item" + (/*custom*/ ctx[1].className
    			? " " + /*custom*/ ctx[1].className
    			: "")) + " svelte-15mdz08"))) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (dirty & /*custom, item*/ 3 && a_href_value !== (a_href_value = /*custom*/ ctx[1].noLink
    			? ""
    			: /*custom*/ ctx[1].url || /*item*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*custom, item*/ 3 && a_title_value !== (a_title_value = /*custom*/ ctx[1].title
    			? /*custom*/ ctx[1].title
    			: "/" + /*item*/ ctx[0].url)) {
    				attr_dev(a, "title", a_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavItem", slots, []);
    	let { item = {} } = $$props;
    	let { custom = {} } = $$props;
    	const writable_props = ["item", "custom"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("custom" in $$props) $$invalidate(1, custom = $$props.custom);
    	};

    	$$self.$capture_state = () => ({ item, custom });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("custom" in $$props) $$invalidate(1, custom = $$props.custom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, custom];
    }

    class NavItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { item: 0, custom: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavItem",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get item() {
    		throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\nav\NavGroups.svelte generated by Svelte v3.31.0 */
    const file$7 = "templates\\components\\nav\\NavGroups.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (15:16) {#each group.items as item(item.url)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let navitem;
    	let current;

    	navitem = new NavItem({
    			props: {
    				item: /*item*/ ctx[5],
    				custom: /*custom*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(navitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(navitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navitem_changes = {};
    			if (dirty & /*navGroups*/ 1) navitem_changes.item = /*item*/ ctx[5];
    			navitem.$set(navitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(navitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(15:16) {#each group.items as item(item.url)}",
    		ctx
    	});

    	return block;
    }

    // (14:12) <Accordion.Section title={group.category}>
    function create_default_slot_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value_1 = /*group*/ ctx[2].items;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[5].url;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navGroups, custom*/ 3) {
    				const each_value_1 = /*group*/ ctx[2].items;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, t.parentNode, outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(14:12) <Accordion.Section title={group.category}>",
    		ctx
    	});

    	return block;
    }

    // (13:8) {#each navGroups as group(group.category)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let accordion_section;
    	let current;

    	accordion_section = new Accordion.Section({
    			props: {
    				title: /*group*/ ctx[2].category,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(accordion_section.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(accordion_section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_section_changes = {};
    			if (dirty & /*navGroups*/ 1) accordion_section_changes.title = /*group*/ ctx[2].category;

    			if (dirty & /*$$scope, navGroups*/ 257) {
    				accordion_section_changes.$$scope = { dirty, ctx };
    			}

    			accordion_section.$set(accordion_section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion_section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion_section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(accordion_section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:8) {#each navGroups as group(group.category)}",
    		ctx
    	});

    	return block;
    }

    // (12:4) <Accordion>
    function create_default_slot$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*navGroups*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*group*/ ctx[2].category;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navGroups, custom*/ 3) {
    				const each_value = /*navGroups*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(12:4) <Accordion>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let accordion;
    	let div_intro;
    	let div_outro;
    	let current;

    	accordion = new Accordion({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(accordion.$$.fragment);
    			attr_dev(div, "class", "nav-list");
    			add_location(div, file$7, 10, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(accordion, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordion_changes = {};

    			if (dirty & /*$$scope, navGroups*/ 257) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(accordion);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavGroups", slots, []);
    	const custom = {};
    	let { navGroups } = $$props;
    	const writable_props = ["navGroups"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavGroups> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("navGroups" in $$props) $$invalidate(0, navGroups = $$props.navGroups);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Accordion,
    		NavItem,
    		custom,
    		navGroups
    	});

    	$$self.$inject_state = $$props => {
    		if ("navGroups" in $$props) $$invalidate(0, navGroups = $$props.navGroups);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [navGroups, custom];
    }

    class NavGroups extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { navGroups: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavGroups",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*navGroups*/ ctx[0] === undefined && !("navGroups" in props)) {
    			console.warn("<NavGroups> was created without expected prop 'navGroups'");
    		}
    	}

    	get navGroups() {
    		throw new Error("<NavGroups>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navGroups(value) {
    		throw new Error("<NavGroups>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\nav\NavList.svelte generated by Svelte v3.31.0 */
    const file$8 = "templates\\components\\nav\\NavList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (11:4) {#each navList as item(item.url)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let navitem;
    	let current;

    	navitem = new NavItem({
    			props: {
    				item: /*item*/ ctx[2],
    				custom: /*custom*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(navitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(navitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navitem_changes = {};
    			if (dirty & /*navList*/ 1) navitem_changes.item = /*item*/ ctx[2];
    			navitem.$set(navitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(navitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:4) {#each navList as item(item.url)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_intro;
    	let div_outro;
    	let current;
    	let each_value = /*navList*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[2].url;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "nav-list");
    			add_location(div, file$8, 8, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navList, custom*/ 3) {
    				const each_value = /*navList*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavList", slots, []);
    	const custom = {};
    	let { navList } = $$props;
    	const writable_props = ["navList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("navList" in $$props) $$invalidate(0, navList = $$props.navList);
    	};

    	$$self.$capture_state = () => ({ fade, NavItem, custom, navList });

    	$$self.$inject_state = $$props => {
    		if ("navList" in $$props) $$invalidate(0, navList = $$props.navList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [navList, custom];
    }

    class NavList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { navList: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavList",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*navList*/ ctx[0] === undefined && !("navList" in props)) {
    			console.warn("<NavList> was created without expected prop 'navList'");
    		}
    	}

    	get navList() {
    		throw new Error("<NavList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navList(value) {
    		throw new Error("<NavList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\md\MdBrightnessLow.svelte generated by Svelte v3.31.0 */
    const file$9 = "node_modules\\svelte-icons\\md\\MdBrightnessLow.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z");
    			add_location(path, file$9, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdBrightnessLow", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdBrightnessLow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdBrightnessLow",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdClose.svelte generated by Svelte v3.31.0 */
    const file$a = "node_modules\\svelte-icons\\md\\MdClose.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$a, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdClose", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdClose extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdClose",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdAdjust.svelte generated by Svelte v3.31.0 */
    const file$b = "node_modules\\svelte-icons\\md\\MdAdjust.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z");
    			add_location(path, file$b, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdAdjust", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdAdjust extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdAdjust",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    let outsideClickListener;

    const removeClickListener = listener => {
        if (listener) { 
            document.removeEventListener('click', listener); 
        }
        if (outsideClickListener) { 
            document.removeEventListener('click', outsideClickListener); 
        }
    };

    const modalize = (element, active, oldListener) => {

        removeClickListener(oldListener);

        if (element && active) {
            outsideClickListener = event => {
                if (!element.contains(event.target)) { 
                    active.set(false);
                    removeClickListener();
                }
            };

            document.addEventListener('click', outsideClickListener);
        }

        return outsideClickListener;
    };

    /* templates\components\nav\ListSwitcher.svelte generated by Svelte v3.31.0 */
    const file$c = "templates\\components\\nav\\ListSwitcher.svelte";

    // (67:0) {#if $showSwitcher}
    function create_if_block$4(ctx) {
    	let div14;
    	let div0;
    	let mdclose;
    	let t0;
    	let div1;
    	let t2;
    	let div3;
    	let div2;
    	let t4;
    	let mdadjust;
    	let div3_class_value;
    	let t5;
    	let div5;
    	let div4;
    	let t7;
    	let current_block_type_index;
    	let if_block;
    	let div5_class_value;
    	let t8;
    	let div6;
    	let t10;
    	let div8;
    	let div7;
    	let div8_class_value;
    	let t12;
    	let div10;
    	let div9;
    	let div10_class_value;
    	let t14;
    	let div12;
    	let div11;
    	let div12_class_value;
    	let t16;
    	let div13;
    	let div14_transition;
    	let current;
    	let mounted;
    	let dispose;
    	mdclose = new MdClose({ $$inline: true });
    	mdadjust = new MdAdjust({ $$inline: true });
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$sortDirection*/ ctx[6] === "ascending") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			div0 = element("div");
    			create_component(mdclose.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "Nav Display";
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Group";
    			t4 = space();
    			create_component(mdadjust.$$.fragment);
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "List";
    			t7 = space();
    			if_block.c();
    			t8 = space();
    			div6 = element("div");
    			div6.textContent = "Sort By";
    			t10 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div7.textContent = "Date";
    			t12 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Title";
    			t14 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "URL";
    			t16 = space();
    			div13 = element("div");
    			attr_dev(div0, "class", "close-me svelte-1bznl0s");
    			add_location(div0, file$c, 69, 12, 2180);
    			attr_dev(div1, "class", "switch-title svelte-1bznl0s");
    			add_location(div1, file$c, 71, 12, 2260);
    			attr_dev(div2, "class", "text");
    			add_location(div2, file$c, 75, 16, 2457);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty("switch-option group" + (/*$orderType*/ ctx[5] === "group" ? " active" : "")) + " svelte-1bznl0s"));
    			add_location(div3, file$c, 73, 12, 2319);
    			attr_dev(div4, "class", "text");
    			add_location(div4, file$c, 80, 16, 2686);
    			attr_dev(div5, "class", div5_class_value = "" + (null_to_empty("switch-option sort" + (/*$orderType*/ ctx[5] !== "group" ? " active" : "")) + " svelte-1bznl0s"));
    			add_location(div5, file$c, 78, 12, 2550);
    			attr_dev(div6, "class", "switch-title svelte-1bznl0s");
    			add_location(div6, file$c, 88, 12, 2932);
    			attr_dev(div7, "class", "text");
    			add_location(div7, file$c, 92, 16, 3119);
    			attr_dev(div8, "data-sort-type", "date");
    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("date", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"));
    			add_location(div8, file$c, 90, 12, 2987);
    			attr_dev(div9, "class", "text");
    			add_location(div9, file$c, 97, 16, 3317);
    			attr_dev(div10, "data-sort-type", "title");
    			attr_dev(div10, "class", div10_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("title", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"));
    			add_location(div10, file$c, 95, 12, 3183);
    			attr_dev(div11, "class", "text");
    			add_location(div11, file$c, 102, 16, 3512);
    			attr_dev(div12, "data-sort-type", "url");
    			attr_dev(div12, "class", div12_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("url", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"));
    			add_location(div12, file$c, 100, 12, 3382);
    			attr_dev(div13, "class", "switch-spacer svelte-1bznl0s");
    			add_location(div13, file$c, 105, 12, 3575);
    			attr_dev(div14, "class", "list-switcher svelte-1bznl0s");
    			add_location(div14, file$c, 67, 4, 2070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div0);
    			mount_component(mdclose, div0, null);
    			append_dev(div14, t0);
    			append_dev(div14, div1);
    			append_dev(div14, t2);
    			append_dev(div14, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t4);
    			mount_component(mdadjust, div3, null);
    			append_dev(div14, t5);
    			append_dev(div14, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t7);
    			if_blocks[current_block_type_index].m(div5, null);
    			append_dev(div14, t8);
    			append_dev(div14, div6);
    			append_dev(div14, t10);
    			append_dev(div14, div8);
    			append_dev(div8, div7);
    			append_dev(div14, t12);
    			append_dev(div14, div10);
    			append_dev(div10, div9);
    			append_dev(div14, t14);
    			append_dev(div14, div12);
    			append_dev(div12, div11);
    			append_dev(div14, t16);
    			append_dev(div14, div13);
    			/*div14_binding*/ ctx[17](div14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closeSwitcher*/ ctx[10], false, false, false),
    					listen_dev(div3, "click", /*toggleGroup*/ ctx[11], false, false, false),
    					listen_dev(div5, "click", /*toggleSort*/ ctx[12], false, false, false),
    					listen_dev(div8, "click", /*toggleSortType*/ ctx[13], false, false, false),
    					listen_dev(div10, "click", /*toggleSortType*/ ctx[13], false, false, false),
    					listen_dev(div12, "click", /*toggleSortType*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$orderType*/ 32 && div3_class_value !== (div3_class_value = "" + (null_to_empty("switch-option group" + (/*$orderType*/ ctx[5] === "group" ? " active" : "")) + " svelte-1bznl0s"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div5, null);
    			}

    			if (!current || dirty & /*$orderType*/ 32 && div5_class_value !== (div5_class_value = "" + (null_to_empty("switch-option sort" + (/*$orderType*/ ctx[5] !== "group" ? " active" : "")) + " svelte-1bznl0s"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (!current || dirty & /*$activeSort*/ 128 && div8_class_value !== (div8_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("date", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"))) {
    				attr_dev(div8, "class", div8_class_value);
    			}

    			if (!current || dirty & /*$activeSort*/ 128 && div10_class_value !== (div10_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("title", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"))) {
    				attr_dev(div10, "class", div10_class_value);
    			}

    			if (!current || dirty & /*$activeSort*/ 128 && div12_class_value !== (div12_class_value = "" + (null_to_empty(/*getSortClass*/ ctx[14]("url", /*$activeSort*/ ctx[7])) + " svelte-1bznl0s"))) {
    				attr_dev(div12, "class", div12_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdclose.$$.fragment, local);
    			transition_in(mdadjust.$$.fragment, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div14_transition) div14_transition = create_bidirectional_transition(div14, fly, { y: -150, duration: 400 }, true);
    				div14_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdclose.$$.fragment, local);
    			transition_out(mdadjust.$$.fragment, local);
    			transition_out(if_block);
    			if (!div14_transition) div14_transition = create_bidirectional_transition(div14, fly, { y: -150, duration: 400 }, false);
    			div14_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    			destroy_component(mdclose);
    			destroy_component(mdadjust);
    			if_blocks[current_block_type_index].d();
    			/*div14_binding*/ ctx[17](null);
    			if (detaching && div14_transition) div14_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(67:0) {#if $showSwitcher}",
    		ctx
    	});

    	return block;
    }

    // (84:16) {:else}
    function create_else_block$1(ctx) {
    	let mdarrowdropup;
    	let current;
    	mdarrowdropup = new MdArrowDropUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdarrowdropup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdarrowdropup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdarrowdropup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdarrowdropup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdarrowdropup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(84:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (82:16) {#if $sortDirection === 'ascending'}
    function create_if_block_1$1(ctx) {
    	let mdarrowdropdown;
    	let current;
    	mdarrowdropdown = new MdArrowDropDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdarrowdropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdarrowdropdown, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdarrowdropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdarrowdropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdarrowdropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(82:16) {#if $sortDirection === 'ascending'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let mdbrightnesslow;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	mdbrightnesslow = new MdBrightnessLow({ $$inline: true });
    	let if_block = /*$showSwitcher*/ ctx[8] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mdbrightnesslow.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "switcher-bug svelte-1bznl0s");
    			add_location(div, file$c, 65, 0, 1966);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mdbrightnesslow, div, null);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleSwitcher*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$showSwitcher*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$showSwitcher*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbrightnesslow.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbrightnesslow.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mdbrightnesslow);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $orderType,
    		$$unsubscribe_orderType = noop,
    		$$subscribe_orderType = () => ($$unsubscribe_orderType(), $$unsubscribe_orderType = subscribe(orderType, $$value => $$invalidate(5, $orderType = $$value)), orderType);

    	let $sortDirection,
    		$$unsubscribe_sortDirection = noop,
    		$$subscribe_sortDirection = () => ($$unsubscribe_sortDirection(), $$unsubscribe_sortDirection = subscribe(sortDirection, $$value => $$invalidate(6, $sortDirection = $$value)), sortDirection);

    	let $activeSort,
    		$$unsubscribe_activeSort = noop,
    		$$subscribe_activeSort = () => ($$unsubscribe_activeSort(), $$unsubscribe_activeSort = subscribe(activeSort, $$value => $$invalidate(7, $activeSort = $$value)), activeSort);

    	let $showSwitcher,
    		$$unsubscribe_showSwitcher = noop,
    		$$subscribe_showSwitcher = () => ($$unsubscribe_showSwitcher(), $$unsubscribe_showSwitcher = subscribe(showSwitcher, $$value => $$invalidate(8, $showSwitcher = $$value)), showSwitcher);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_orderType());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_sortDirection());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_activeSort());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_showSwitcher());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListSwitcher", slots, []);
    	let { orderType } = $$props;
    	validate_store(orderType, "orderType");
    	$$subscribe_orderType();
    	let { sortDirection } = $$props;
    	validate_store(sortDirection, "sortDirection");
    	$$subscribe_sortDirection();
    	let { showSwitcher } = $$props;
    	validate_store(showSwitcher, "showSwitcher");
    	$$subscribe_showSwitcher();
    	let { sortMethods = {} } = $$props;
    	let { activeSort } = $$props;
    	validate_store(activeSort, "activeSort");
    	$$subscribe_activeSort();
    	let { updateMeta = () => false } = $$props;
    	let switcherEl;
    	let switcherListener;

    	const toggleSwitcher = () => {
    		showSwitcher.set(true);

    		setTimeout(
    			() => {
    				switcherListener = modalize(switcherEl, showSwitcher, switcherListener);
    			},
    			50
    		);
    	};

    	const closeSwitcher = () => {
    		modalize(null, null, switcherListener);
    		showSwitcher.set(false);
    	};

    	const toggleGroup = () => {
    		orderType.set("group");
    		updateMeta();
    	};

    	const toggleSort = () => {
    		if ($orderType === "listing") {
    			if ($sortDirection === "ascending") {
    				sortDirection.set("descending");
    			} else {
    				sortDirection.set("ascending");
    			}
    		}

    		orderType.set("listing");
    		updateMeta();
    	};

    	const toggleSortType = event => {
    		const sortType = event.currentTarget.dataset.sortType;

    		if ($activeSort !== sortMethods[sortType]) {
    			activeSort.set(sortMethods[sortType]);
    		}

    		updateMeta();
    	};

    	const getSortClass = (type, active) => "switch-option sort-type" + (active === sortMethods[type] ? " active" : "");

    	const writable_props = [
    		"orderType",
    		"sortDirection",
    		"showSwitcher",
    		"sortMethods",
    		"activeSort",
    		"updateMeta"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListSwitcher> was created with unknown prop '${key}'`);
    	});

    	function div14_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			switcherEl = $$value;
    			$$invalidate(4, switcherEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("orderType" in $$props) $$subscribe_orderType($$invalidate(0, orderType = $$props.orderType));
    		if ("sortDirection" in $$props) $$subscribe_sortDirection($$invalidate(1, sortDirection = $$props.sortDirection));
    		if ("showSwitcher" in $$props) $$subscribe_showSwitcher($$invalidate(2, showSwitcher = $$props.showSwitcher));
    		if ("sortMethods" in $$props) $$invalidate(15, sortMethods = $$props.sortMethods);
    		if ("activeSort" in $$props) $$subscribe_activeSort($$invalidate(3, activeSort = $$props.activeSort));
    		if ("updateMeta" in $$props) $$invalidate(16, updateMeta = $$props.updateMeta);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		MdArrowDropDown,
    		MdArrowDropUp,
    		MdBrightnessLow,
    		MdClose,
    		MdAdjust,
    		modalize,
    		orderType,
    		sortDirection,
    		showSwitcher,
    		sortMethods,
    		activeSort,
    		updateMeta,
    		switcherEl,
    		switcherListener,
    		toggleSwitcher,
    		closeSwitcher,
    		toggleGroup,
    		toggleSort,
    		toggleSortType,
    		getSortClass,
    		$orderType,
    		$sortDirection,
    		$activeSort,
    		$showSwitcher
    	});

    	$$self.$inject_state = $$props => {
    		if ("orderType" in $$props) $$subscribe_orderType($$invalidate(0, orderType = $$props.orderType));
    		if ("sortDirection" in $$props) $$subscribe_sortDirection($$invalidate(1, sortDirection = $$props.sortDirection));
    		if ("showSwitcher" in $$props) $$subscribe_showSwitcher($$invalidate(2, showSwitcher = $$props.showSwitcher));
    		if ("sortMethods" in $$props) $$invalidate(15, sortMethods = $$props.sortMethods);
    		if ("activeSort" in $$props) $$subscribe_activeSort($$invalidate(3, activeSort = $$props.activeSort));
    		if ("updateMeta" in $$props) $$invalidate(16, updateMeta = $$props.updateMeta);
    		if ("switcherEl" in $$props) $$invalidate(4, switcherEl = $$props.switcherEl);
    		if ("switcherListener" in $$props) switcherListener = $$props.switcherListener;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		orderType,
    		sortDirection,
    		showSwitcher,
    		activeSort,
    		switcherEl,
    		$orderType,
    		$sortDirection,
    		$activeSort,
    		$showSwitcher,
    		toggleSwitcher,
    		closeSwitcher,
    		toggleGroup,
    		toggleSort,
    		toggleSortType,
    		getSortClass,
    		sortMethods,
    		updateMeta,
    		div14_binding
    	];
    }

    class ListSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			orderType: 0,
    			sortDirection: 1,
    			showSwitcher: 2,
    			sortMethods: 15,
    			activeSort: 3,
    			updateMeta: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListSwitcher",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*orderType*/ ctx[0] === undefined && !("orderType" in props)) {
    			console.warn("<ListSwitcher> was created without expected prop 'orderType'");
    		}

    		if (/*sortDirection*/ ctx[1] === undefined && !("sortDirection" in props)) {
    			console.warn("<ListSwitcher> was created without expected prop 'sortDirection'");
    		}

    		if (/*showSwitcher*/ ctx[2] === undefined && !("showSwitcher" in props)) {
    			console.warn("<ListSwitcher> was created without expected prop 'showSwitcher'");
    		}

    		if (/*activeSort*/ ctx[3] === undefined && !("activeSort" in props)) {
    			console.warn("<ListSwitcher> was created without expected prop 'activeSort'");
    		}
    	}

    	get orderType() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orderType(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortDirection() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortDirection(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showSwitcher() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showSwitcher(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortMethods() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortMethods(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSort() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSort(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateMeta() {
    		throw new Error("<ListSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateMeta(value) {
    		throw new Error("<ListSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const HOME_DIRECTORY = '__HOME__';
    const HOME_PAGE_CATEGORY = 'NO_CATEGORY_FRONT_PAGE';



    const sortMethods = (() => {
        const fullT= item => (item.title || '' ) + 
            (item.subtitle_A ? ' ' + item.subtitle_A : '') + 
            (item.subtitle_B ? ' ' + item.subtitle_B : '');

        const sortByURL = (A, B) => A.url < B.url ? -1 : A.url > B.url ? 1 : 0;
        const sortByTitle = (A, B) => fullT(A) < fullT(B) ? -1 : fullT(A) > fullT(B) ? 1 : 0;

        const sortByDate = (A, B) => A.date < B.date ? -1 : A.date > B.date ? 1 : 0;

        return {
            title: sortByTitle,
            date: sortByDate,
            url: sortByURL
        };
    })();

    const getList = (albums, direction, activeSort, current) => {
        if (direction === 'descending') {
            return [...albums].sort(activeSort).reverse()
                .filter(next => next.url !== current && next.url !== HOME_DIRECTORY);
        }
        return [...albums].sort(activeSort)
            .filter(next => next.url !== current && next.url !== HOME_DIRECTORY);
    };

    const composeNavGroups = (list, categories) => categories
        .filter(cat => cat !== HOME_PAGE_CATEGORY)
        .map(cat => ({
            category: cat,
            items: list.filter(next => next.navCategories && next.navCategories.includes(cat))
        }))
        .filter(group => (group.items && group.items.length));

    /* templates\Nav.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1, console: console_1$1 } = globals;

    const file$d = "templates\\Nav.svelte";

    // (102:4) {#if $active}
    function create_if_block$5(ctx) {
    	let navitem;
    	let t0;
    	let t1;
    	let listswitcher;
    	let t2;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	navitem = new NavItem({
    			props: {
    				item: /*homeItem*/ ctx[7],
    				custom: /*custom*/ ctx[8]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*currentItem*/ ctx[5] !== /*homeItem*/ ctx[7] && create_if_block_2(ctx);

    	listswitcher = new ListSwitcher({
    			props: {
    				showSwitcher: /*showSwitcher*/ ctx[13],
    				orderType: /*orderType*/ ctx[10],
    				sortDirection: /*sortDirection*/ ctx[11],
    				sortMethods,
    				activeSort: /*activeSort*/ ctx[12],
    				updateMeta: /*updateMeta*/ ctx[14]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$orderType*/ ctx[0] === "group") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navitem.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(listswitcher.$$.fragment);
    			t2 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(navitem, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listswitcher, target, anchor);
    			insert_dev(target, t2, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navitem_changes = {};
    			if (dirty & /*homeItem*/ 128) navitem_changes.item = /*homeItem*/ ctx[7];
    			navitem.$set(navitem_changes);

    			if (/*currentItem*/ ctx[5] !== /*homeItem*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*currentItem, homeItem*/ 160) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitem.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(listswitcher.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitem.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(listswitcher.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navitem, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listswitcher, detaching);
    			if (detaching) detach_dev(t2);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(102:4) {#if $active}",
    		ctx
    	});

    	return block;
    }

    // (106:8) {#if currentItem !== homeItem}
    function create_if_block_2(ctx) {
    	let navitem;
    	let current;

    	navitem = new NavItem({
    			props: {
    				custom: { className: "current" },
    				item: /*currentItem*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navitem_changes = {};
    			if (dirty & /*currentItem*/ 32) navitem_changes.item = /*currentItem*/ ctx[5];
    			navitem.$set(navitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(106:8) {#if currentItem !== homeItem}",
    		ctx
    	});

    	return block;
    }

    // (120:8) {:else}
    function create_else_block$2(ctx) {
    	let navlist;
    	let current;

    	navlist = new NavList({
    			props: { navList: /*navList*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navlist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navlist_changes = {};
    			if (dirty & /*navList*/ 2) navlist_changes.navList = /*navList*/ ctx[1];
    			navlist.$set(navlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(120:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (118:8) {#if $orderType === 'group'}
    function create_if_block_1$2(ctx) {
    	let navgroups;
    	let current;

    	navgroups = new NavGroups({
    			props: { navGroups: /*navGroups*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navgroups.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navgroups, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navgroups_changes = {};
    			if (dirty & /*navGroups*/ 16) navgroups_changes.navGroups = /*navGroups*/ ctx[4];
    			navgroups.$set(navgroups_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navgroups.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navgroups.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navgroups, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(118:8) {#if $orderType === 'group'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let if_block = /*$active*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*sidebarClass*/ ctx[6]) + " svelte-n7uivf"));
    			add_location(div, file$d, 100, 0, 3199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$active*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$active*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*sidebarClass*/ 64 && div_class_value !== (div_class_value = "" + (null_to_empty(/*sidebarClass*/ ctx[6]) + " svelte-n7uivf"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $activeSort;
    	let $orderType;
    	let $sortDirection;
    	let $NavStore;
    	let $active;
    	validate_store(NavStore, "NavStore");
    	component_subscribe($$self, NavStore, $$value => $$invalidate(19, $NavStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	const custom = {};
    	const active = writable(null);
    	validate_store(active, "active");
    	component_subscribe($$self, active, value => $$invalidate(2, $active = value));
    	const orderType = writable("group");
    	validate_store(orderType, "orderType");
    	component_subscribe($$self, orderType, value => $$invalidate(0, $orderType = value));
    	const sortDirection = writable("ascending");
    	validate_store(sortDirection, "sortDirection");
    	component_subscribe($$self, sortDirection, value => $$invalidate(18, $sortDirection = value));
    	const activeSort = writable(sortMethods.date);
    	validate_store(activeSort, "activeSort");
    	component_subscribe($$self, activeSort, value => $$invalidate(17, $activeSort = value));
    	const showSwitcher = writable(null);
    	let current;
    	let categories = [];
    	let sidebar;
    	let sidebarListener;

    	const updateMeta = (() => {
    		const getMethod = () => {
    			for (const [methodName, method] of Object.entries(sortMethods)) {
    				if ($activeSort === method) {
    					return methodName;
    				}
    			}

    			return "date";
    		};

    		return () => {
    			const update = {
    				orderType: $orderType,
    				sortDirection: $sortDirection,
    				sortMethod: getMethod()
    			};

    			NavStore.updateMeta(update);
    		};
    	})();

    	const getSidebarClass = activeState => {
    		if (activeState) {
    			sidebarListener = modalize(sidebar, active, sidebarListener);
    		}

    		console.log("orderType", orderType);
    		console.log("$orderType", $orderType);
    		console.log("navGroups", navGroups);
    		console.log("navList", navList);
    		return "nav-sidebar" + (activeState ? " active" : "");
    	};

    	const toggleNav = () => {
    		if (!$active) {
    			setTimeout(
    				() => {
    					active.set(!$active);
    				},
    				10
    			);
    		}
    	};

    	const initOptions = () => {
    		$$invalidate(15, current = window.NAV_DATA.currentURL);
    		$$invalidate(16, categories = [...window.NAV_DATA.categories].sort());
    		activeSort.set(sortMethods[$NavStore.sortMethod] || sortMethods.date);
    		orderType.set($NavStore.orderType || "group");
    		sortDirection.set($NavStore.sortDirection || "ascending");
    	};

    	const initNavButton = () => {
    		const navButton = document.querySelector("#headerBar .menu-button");

    		if (navButton) {
    			navButton.addEventListener("click", toggleNav);
    		}

    		setTimeout(initOptions, 100);
    	};

    	onMount(initNavButton);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sidebar = $$value;
    			$$invalidate(3, sidebar);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		writable,
    		NavStore,
    		NavGroups,
    		NavList,
    		NavItem,
    		ListSwitcher,
    		modalize,
    		composeNavGroups,
    		getList,
    		sortMethods,
    		custom,
    		active,
    		orderType,
    		sortDirection,
    		activeSort,
    		showSwitcher,
    		current,
    		categories,
    		sidebar,
    		sidebarListener,
    		updateMeta,
    		getSidebarClass,
    		toggleNav,
    		initOptions,
    		initNavButton,
    		$activeSort,
    		$orderType,
    		$sortDirection,
    		navGroups,
    		navList,
    		$NavStore,
    		$active,
    		currentItem,
    		sidebarClass,
    		homeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(15, current = $$props.current);
    		if ("categories" in $$props) $$invalidate(16, categories = $$props.categories);
    		if ("sidebar" in $$props) $$invalidate(3, sidebar = $$props.sidebar);
    		if ("sidebarListener" in $$props) sidebarListener = $$props.sidebarListener;
    		if ("navGroups" in $$props) $$invalidate(4, navGroups = $$props.navGroups);
    		if ("navList" in $$props) $$invalidate(1, navList = $$props.navList);
    		if ("currentItem" in $$props) $$invalidate(5, currentItem = $$props.currentItem);
    		if ("sidebarClass" in $$props) $$invalidate(6, sidebarClass = $$props.sidebarClass);
    		if ("homeItem" in $$props) $$invalidate(7, homeItem = $$props.homeItem);
    	};

    	let navList;
    	let currentItem;
    	let navGroups;
    	let sidebarClass;
    	let homeItem;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$NavStore, $sortDirection, $activeSort, current, $orderType, $active*/ 950277) {
    			 $$invalidate(1, navList = getList($NavStore.albums, $sortDirection, $activeSort, current));
    		}

    		if ($$self.$$.dirty & /*$NavStore, current*/ 557056) {
    			 $$invalidate(5, currentItem = $NavStore.albums.find(next => next.url === current));
    		}

    		if ($$self.$$.dirty & /*navList, categories*/ 65538) {
    			 $$invalidate(4, navGroups = composeNavGroups(navList, categories));
    		}

    		if ($$self.$$.dirty & /*$active*/ 4) {
    			 $$invalidate(6, sidebarClass = getSidebarClass($active));
    		}
    	};

    	 $$invalidate(7, homeItem = {
    		title: "Home",
    		className: "home",
    		url: "../"
    	});

    	return [
    		$orderType,
    		navList,
    		$active,
    		sidebar,
    		navGroups,
    		currentItem,
    		sidebarClass,
    		homeItem,
    		custom,
    		active,
    		orderType,
    		sortDirection,
    		activeSort,
    		showSwitcher,
    		updateMeta,
    		current,
    		categories,
    		$activeSort,
    		$sortDirection,
    		$NavStore,
    		div_binding
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const hydrateSharedData = navData => {
        const categories = [];

        for (const album of navData.albums) {
            for (const cat of album.navCategories) {
                if (!categories.includes(cat)) {
                    categories.push(cat);
                }
            }
        }

        window.NAV_DATA = window.NAV_DATA || {};
        window.NAV_DATA.categories = categories;

    };

    const NavApp = navData => {

        if (!navData) {
            console.error('navData not found');
            return;
        }

        NavStore.set(navData);
        hydrateSharedData(navData);

        console.log('navApp Started!');
        const urls = [];
        for (const next of navData.albums) {
            if (urls.includes(next.url)) {
                console.log('DUPE!', next.url);
            } else {
                urls.push(next.url);
            }
        }
        console.log('navData', navData);

        // eslint-disable-next-line no-unused-vars
        const navApp = new Nav({
            target: document.getElementById('navApp'),
            props: {}
        });


    };

    window.NavApp = NavApp;

}());
//# sourceMappingURL=nav-app.js.map
