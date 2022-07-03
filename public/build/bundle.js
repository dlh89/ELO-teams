
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
                started = true;
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
            const d = (program.b - t);
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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

    /* src\AddPlayer.svelte generated by Svelte v3.46.4 */

    const file$5 = "src\\AddPlayer.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let form;
    	let label;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label = element("label");
    			label.textContent = "Add a player:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			attr_dev(label, "for", "player js-add-player-btn");
    			add_location(label, file$5, 2, 2, 43);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "player");
    			attr_dev(input0, "name", "playerName");
    			add_location(input0, file$5, 3, 2, 106);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Add player";
    			add_location(input1, file$5, 4, 2, 159);
    			add_location(form, file$5, 1, 1, 8);
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			append_dev(form, t2);
    			append_dev(form, input1);

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[0]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddPlayer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddPlayer> was created with unknown prop '${key}'`);
    	});

    	function submit_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	return [submit_handler];
    }

    class AddPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPlayer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src\PlayerSelection.svelte generated by Svelte v3.46.4 */
    const file$4 = "src\\PlayerSelection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (27:12) {#if playerPool.length }
    function create_if_block_2$1(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value_1 = /*playerPool*/ ctx[2];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*player*/ ctx[10];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Player Pool";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "heading-2");
    			add_location(div0, file$4, 27, 16, 814);
    			add_location(div1, file$4, 28, 16, 888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*playerPool, playerSelect*/ 36) {
    				each_value_1 = /*playerPool*/ ctx[2];
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div1, fix_and_outro_and_destroy_block, create_each_block_1$1, null, get_each_context_1$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    				div0_transition.run(1);
    			});

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    			div0_transition.run(0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(27:12) {#if playerPool.length }",
    		ctx
    	});

    	return block;
    }

    // (30:20) {#each playerPool as player (player)}
    function create_each_block_1$1(key_1, ctx) {
    	let label;
    	let input;
    	let input_name_value;
    	let input_id_value;
    	let t0;
    	let t1_value = /*player*/ ctx[10].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*player*/ ctx[10].elo + "";
    	let t3;
    	let t4;
    	let label_for_value;
    	let label_intro;
    	let label_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let mounted;
    	let dispose;

    	function change_handler() {
    		return /*change_handler*/ ctx[7](/*player*/ ctx[10]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")\r\n                            ");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = /*player*/ ctx[10].uid);
    			attr_dev(input, "id", input_id_value = /*player*/ ctx[10].uid);
    			add_location(input, file$4, 31, 32, 1095);
    			attr_dev(label, "class", "block-label svelte-c36tl");
    			attr_dev(label, "for", label_for_value = /*player*/ ctx[10].uid);
    			add_location(label, file$4, 30, 28, 982);
    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			append_dev(label, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", change_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*playerPool*/ 4 && input_name_value !== (input_name_value = /*player*/ ctx[10].uid)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (!current || dirty & /*playerPool*/ 4 && input_id_value !== (input_id_value = /*player*/ ctx[10].uid)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if ((!current || dirty & /*playerPool*/ 4) && t1_value !== (t1_value = /*player*/ ctx[10].name + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*playerPool*/ 4) && t3_value !== (t3_value = /*player*/ ctx[10].elo + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*playerPool*/ 4 && label_for_value !== (label_for_value = /*player*/ ctx[10].uid)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		r: function measure() {
    			rect = label.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(label);
    			stop_animation();
    			add_transform(label, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(label, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (label_outro) label_outro.end(1);
    				label_intro = create_in_transition(label, /*receive*/ ctx[4], {});
    				label_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (label_intro) label_intro.invalidate();
    			label_outro = create_out_transition(label, /*send*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching && label_outro) label_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(30:20) {#each playerPool as player (player)}",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#if !teamsPicked}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	let if_block = /*selectedPlayers*/ ctx[1].length && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "players-container svelte-c36tl");
    			add_location(div, file$4, 39, 8, 1427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*selectedPlayers*/ ctx[1].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selectedPlayers*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(39:4) {#if !teamsPicked}",
    		ctx
    	});

    	return block;
    }

    // (41:12) {#if selectedPlayers.length }
    function create_if_block_1$2(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*selectedPlayers*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*player*/ ctx[10];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Active Players";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "heading-2");
    			add_location(div0, file$4, 41, 16, 1520);
    			add_location(div1, file$4, 42, 16, 1597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedPlayers, playerSelect*/ 34) {
    				each_value = /*selectedPlayers*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, fix_and_outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    				div0_transition.run(1);
    			});

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    			div0_transition.run(0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(41:12) {#if selectedPlayers.length }",
    		ctx
    	});

    	return block;
    }

    // (44:20) {#each selectedPlayers as player (player)}
    function create_each_block$1(key_1, ctx) {
    	let label;
    	let input;
    	let input_name_value;
    	let input_id_value;
    	let t0;
    	let t1_value = /*player*/ ctx[10].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*player*/ ctx[10].elo + "";
    	let t3;
    	let t4;
    	let label_for_value;
    	let label_intro;
    	let label_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let mounted;
    	let dispose;

    	function change_handler_1() {
    		return /*change_handler_1*/ ctx[8](/*player*/ ctx[10]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")\r\n                        ");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = /*player*/ ctx[10].uid);
    			attr_dev(input, "id", input_id_value = /*player*/ ctx[10].uid);
    			input.checked = true;
    			add_location(input, file$4, 45, 28, 1801);
    			attr_dev(label, "class", "block-label svelte-c36tl");
    			attr_dev(label, "for", label_for_value = /*player*/ ctx[10].uid);
    			add_location(label, file$4, 44, 24, 1692);
    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			append_dev(label, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", change_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*selectedPlayers*/ 2 && input_name_value !== (input_name_value = /*player*/ ctx[10].uid)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (!current || dirty & /*selectedPlayers*/ 2 && input_id_value !== (input_id_value = /*player*/ ctx[10].uid)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if ((!current || dirty & /*selectedPlayers*/ 2) && t1_value !== (t1_value = /*player*/ ctx[10].name + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*selectedPlayers*/ 2) && t3_value !== (t3_value = /*player*/ ctx[10].elo + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*selectedPlayers*/ 2 && label_for_value !== (label_for_value = /*player*/ ctx[10].uid)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		r: function measure() {
    			rect = label.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(label);
    			stop_animation();
    			add_transform(label, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(label, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (label_outro) label_outro.end(1);
    				label_intro = create_in_transition(label, /*receive*/ ctx[4], {});
    				label_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (label_intro) label_intro.invalidate();
    			label_outro = create_out_transition(label, /*send*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching && label_outro) label_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(44:20) {#each selectedPlayers as player (player)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let if_block0 = /*playerPool*/ ctx[2].length && create_if_block_2$1(ctx);
    	let if_block1 = !/*teamsPicked*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "players-container svelte-c36tl");
    			add_location(div0, file$4, 25, 8, 726);
    			attr_dev(div1, "class", "player-selection svelte-c36tl");
    			add_location(div1, file$4, 24, 0, 686);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*playerPool*/ ctx[2].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*playerPool*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*teamsPicked*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*teamsPicked*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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

    function instance$4($$self, $$props, $$invalidate) {
    	let playerPool;
    	let selectedPlayers;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PlayerSelection', slots, []);
    	let { players } = $$props;
    	let { teamsPicked } = $$props;
    	const dispatch = createEventDispatcher();
    	const [send, receive] = crossfade({ duration: 400 });

    	function playerSelect(uid, isPlaying) {
    		dispatch('playerSelect', { uid, isPlaying });
    	}

    	const writable_props = ['players', 'teamsPicked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PlayerSelection> was created with unknown prop '${key}'`);
    	});

    	const change_handler = player => playerSelect(player.uid, true);
    	const change_handler_1 = player => playerSelect(player.uid, false);

    	$$self.$$set = $$props => {
    		if ('players' in $$props) $$invalidate(6, players = $$props.players);
    		if ('teamsPicked' in $$props) $$invalidate(0, teamsPicked = $$props.teamsPicked);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		crossfade,
    		flip,
    		players,
    		teamsPicked,
    		dispatch,
    		send,
    		receive,
    		playerSelect,
    		selectedPlayers,
    		playerPool
    	});

    	$$self.$inject_state = $$props => {
    		if ('players' in $$props) $$invalidate(6, players = $$props.players);
    		if ('teamsPicked' in $$props) $$invalidate(0, teamsPicked = $$props.teamsPicked);
    		if ('selectedPlayers' in $$props) $$invalidate(1, selectedPlayers = $$props.selectedPlayers);
    		if ('playerPool' in $$props) $$invalidate(2, playerPool = $$props.playerPool);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*players*/ 64) {
    			$$invalidate(2, playerPool = players.filter(player => !player.isPlaying));
    		}

    		if ($$self.$$.dirty & /*players*/ 64) {
    			$$invalidate(1, selectedPlayers = players.filter(player => player.isPlaying));
    		}
    	};

    	return [
    		teamsPicked,
    		selectedPlayers,
    		playerPool,
    		send,
    		receive,
    		playerSelect,
    		players,
    		change_handler,
    		change_handler_1
    	];
    }

    class PlayerSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { players: 6, teamsPicked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerSelection",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[6] === undefined && !('players' in props)) {
    			console.warn("<PlayerSelection> was created without expected prop 'players'");
    		}

    		if (/*teamsPicked*/ ctx[0] === undefined && !('teamsPicked' in props)) {
    			console.warn("<PlayerSelection> was created without expected prop 'teamsPicked'");
    		}
    	}

    	get players() {
    		throw new Error("<PlayerSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<PlayerSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get teamsPicked() {
    		throw new Error("<PlayerSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teamsPicked(value) {
    		throw new Error("<PlayerSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Teams.svelte generated by Svelte v3.46.4 */
    const file$3 = "src\\Teams.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (17:0) {#if teamsPicked}
    function create_if_block$1(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let ul0;
    	let t2;
    	let div5;
    	let div3;
    	let t4;
    	let div4;
    	let ul1;
    	let t5;
    	let button0;
    	let t7;
    	let button1;
    	let t9;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*teamsPlayers*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*teamsPlayers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Team A";
    			t1 = space();
    			div1 = element("div");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Team B";
    			t4 = space();
    			div4 = element("div");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			button0 = element("button");
    			button0.textContent = "Reshuffle teams";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Edit players";
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Record results";
    			attr_dev(div0, "class", "teams__label svelte-191ymgq");
    			add_location(div0, file$3, 19, 3, 389);
    			add_location(ul0, file$3, 21, 4, 468);
    			attr_dev(div1, "class", "teams__playerbox");
    			add_location(div1, file$3, 20, 3, 432);
    			attr_dev(div2, "class", "teams__team svelte-191ymgq");
    			add_location(div2, file$3, 18, 2, 359);
    			attr_dev(div3, "class", "teams__label svelte-191ymgq");
    			add_location(div3, file$3, 31, 3, 676);
    			add_location(ul1, file$3, 33, 4, 755);
    			attr_dev(div4, "class", "teams__playerbox");
    			add_location(div4, file$3, 32, 3, 719);
    			attr_dev(div5, "class", "teams__team svelte-191ymgq");
    			add_location(div5, file$3, 30, 2, 646);
    			attr_dev(div6, "class", "teams svelte-191ymgq");
    			add_location(div6, file$3, 17, 1, 336);
    			add_location(button0, file$3, 43, 1, 941);
    			add_location(button1, file$3, 44, 1, 985);
    			add_location(button2, file$3, 45, 1, 1045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*modifyPlayerPool*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*openRecordResults*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamsPlayers*/ 1) {
    				each_value_1 = /*teamsPlayers*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*teamsPlayers*/ 1) {
    				each_value = /*teamsPlayers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:0) {#if teamsPicked}",
    		ctx
    	});

    	return block;
    }

    // (24:5) {#if player.team === 'a'}
    function create_if_block_2(ctx) {
    	let li;
    	let t0_value = /*player*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*player*/ ctx[6].elo + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			add_location(li, file$3, 24, 6, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamsPlayers*/ 1 && t0_value !== (t0_value = /*player*/ ctx[6].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*teamsPlayers*/ 1 && t2_value !== (t2_value = /*player*/ ctx[6].elo + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(24:5) {#if player.team === 'a'}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#each teamsPlayers as player}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*player*/ ctx[6].team === 'a' && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*player*/ ctx[6].team === 'a') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(23:4) {#each teamsPlayers as player}",
    		ctx
    	});

    	return block;
    }

    // (36:5) {#if player.team === 'b'}
    function create_if_block_1$1(ctx) {
    	let li;
    	let t0_value = /*player*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*player*/ ctx[6].elo + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			add_location(li, file$3, 36, 6, 835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamsPlayers*/ 1 && t0_value !== (t0_value = /*player*/ ctx[6].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*teamsPlayers*/ 1 && t2_value !== (t2_value = /*player*/ ctx[6].elo + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(36:5) {#if player.team === 'b'}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#each teamsPlayers as player}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*player*/ ctx[6].team === 'b' && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*player*/ ctx[6].team === 'b') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:4) {#each teamsPlayers as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*teamsPicked*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*teamsPicked*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots('Teams', slots, []);
    	let { teamsPlayers } = $$props;
    	let { teamsPicked } = $$props;
    	const dispatch = createEventDispatcher();

    	function modifyPlayerPool() {
    		dispatch('modifyPlayerPool');
    	}

    	function openRecordResults() {
    		dispatch('openRecordResults');
    	}

    	const writable_props = ['teamsPlayers', 'teamsPicked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Teams> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('teamsPlayers' in $$props) $$invalidate(0, teamsPlayers = $$props.teamsPlayers);
    		if ('teamsPicked' in $$props) $$invalidate(1, teamsPicked = $$props.teamsPicked);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		teamsPlayers,
    		teamsPicked,
    		dispatch,
    		modifyPlayerPool,
    		openRecordResults
    	});

    	$$self.$inject_state = $$props => {
    		if ('teamsPlayers' in $$props) $$invalidate(0, teamsPlayers = $$props.teamsPlayers);
    		if ('teamsPicked' in $$props) $$invalidate(1, teamsPicked = $$props.teamsPicked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [teamsPlayers, teamsPicked, modifyPlayerPool, openRecordResults, click_handler];
    }

    class Teams extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { teamsPlayers: 0, teamsPicked: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Teams",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*teamsPlayers*/ ctx[0] === undefined && !('teamsPlayers' in props)) {
    			console.warn("<Teams> was created without expected prop 'teamsPlayers'");
    		}

    		if (/*teamsPicked*/ ctx[1] === undefined && !('teamsPicked' in props)) {
    			console.warn("<Teams> was created without expected prop 'teamsPicked'");
    		}
    	}

    	get teamsPlayers() {
    		throw new Error("<Teams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teamsPlayers(value) {
    		throw new Error("<Teams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get teamsPicked() {
    		throw new Error("<Teams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teamsPicked(value) {
    		throw new Error("<Teams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\RecordResults.svelte generated by Svelte v3.46.4 */
    const file$2 = "src\\RecordResults.svelte";

    function create_fragment$2(ctx) {
    	let p;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Which team won?";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Team A";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Team B";
    			add_location(p, file$2, 13, 0, 287);
    			attr_dev(button0, "data-team", "a");
    			add_location(button0, file$2, 14, 0, 311);
    			attr_dev(button1, "data-team", "b");
    			add_location(button1, file$2, 15, 0, 375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*recordResults*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*recordResults*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('RecordResults', slots, []);
    	const dispatch = createEventDispatcher();

    	function recordResults(e) {
    		const data = { winningTeam: e.target.dataset.team };
    		dispatch('recordResults', data);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RecordResults> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		recordResults
    	});

    	return [recordResults];
    }

    class RecordResults extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RecordResults",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Modal.svelte generated by Svelte v3.46.4 */
    const file$1 = "src\\Modal.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let svg;
    	let circle;
    	let line0;
    	let line1;
    	let t;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			t = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(circle, "cx", "6");
    			attr_dev(circle, "cy", "6");
    			attr_dev(circle, "r", "6");
    			add_location(circle, file$1, 66, 3, 1747);
    			attr_dev(line0, "x1", "3");
    			attr_dev(line0, "y1", "3");
    			attr_dev(line0, "x2", "9");
    			attr_dev(line0, "y2", "9");
    			attr_dev(line0, "class", "svelte-fncg4c");
    			add_location(line0, file$1, 67, 3, 1776);
    			attr_dev(line1, "x1", "9");
    			attr_dev(line1, "y1", "3");
    			attr_dev(line1, "x2", "3");
    			attr_dev(line1, "y2", "9");
    			attr_dev(line1, "class", "svelte-fncg4c");
    			add_location(line1, file$1, 68, 3, 1809);
    			attr_dev(svg, "id", "close");
    			attr_dev(svg, "viewBox", "0 0 12 12");
    			attr_dev(svg, "class", "svelte-fncg4c");
    			add_location(svg, file$1, 65, 2, 1683);
    			attr_dev(div0, "id", "modal-content");
    			attr_dev(div0, "class", "svelte-fncg4c");
    			add_location(div0, file$1, 70, 2, 1851);
    			attr_dev(div1, "id", "modal");
    			attr_dev(div1, "class", "svelte-fncg4c");
    			add_location(div1, file$1, 64, 1, 1629);
    			attr_dev(div2, "id", "topModal");
    			attr_dev(div2, "class", "svelte-fncg4c");
    			toggle_class(div2, "visible", /*visible*/ ctx[1]);
    			add_location(div2, file$1, 63, 0, 1551);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, circle);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div2_binding*/ ctx[7](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "click", stop_propagation(click_handler_1), false, false, true),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*visible*/ 2) {
    				toggle_class(div2, "visible", /*visible*/ ctx[1]);
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
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div2_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
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

    let onTop; //keeping track of which open modal is on top
    const modals = {}; //all modals get registered here for easy future access

    function getModal(id = '') {
    	return modals[id];
    }

    const click_handler_1 = () => {
    	
    };

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let topDiv;
    	let visible = false;
    	let prevOnTop;
    	let closeCallback;
    	let { id = '' } = $$props;

    	function keyPress(ev) {
    		//only respond if the current modal is the top one
    		if (ev.key == "Escape" && onTop == topDiv) close(); //ESC
    	}

    	/**  API **/
    	function open(callback) {
    		closeCallback = callback;
    		if (visible) return;
    		prevOnTop = onTop;
    		onTop = topDiv;
    		window.addEventListener("keydown", keyPress);

    		//this prevents scrolling of the main window on larger screens
    		document.body.style.overflow = "hidden";

    		$$invalidate(1, visible = true);

    		//Move the modal in the DOM to be the last child of <BODY> so that it can be on top of everything
    		document.body.appendChild(topDiv);
    	}

    	function close(retVal) {
    		if (!visible) return;
    		window.removeEventListener("keydown", keyPress);
    		onTop = prevOnTop;
    		if (onTop == null) document.body.style.overflow = "";
    		$$invalidate(1, visible = false);
    		if (closeCallback) closeCallback(retVal);
    	}

    	//expose the API
    	modals[id] = { open, close };

    	onDestroy(() => {
    		delete modals[id];
    		window.removeEventListener("keydown", keyPress);
    	});

    	const writable_props = ['id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => close();

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			topDiv = $$value;
    			$$invalidate(0, topDiv);
    		});
    	}

    	const click_handler_2 = () => close();

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onTop,
    		modals,
    		getModal,
    		onDestroy,
    		topDiv,
    		visible,
    		prevOnTop,
    		closeCallback,
    		id,
    		keyPress,
    		open,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ('topDiv' in $$props) $$invalidate(0, topDiv = $$props.topDiv);
    		if ('visible' in $$props) $$invalidate(1, visible = $$props.visible);
    		if ('prevOnTop' in $$props) prevOnTop = $$props.prevOnTop;
    		if ('closeCallback' in $$props) closeCallback = $$props.closeCallback;
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		topDiv,
    		visible,
    		close,
    		id,
    		$$scope,
    		slots,
    		click_handler,
    		div2_binding,
    		click_handler_2
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get id() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const startingElo = 1500;
    const k = 30; // TODO why 30?

    class CalculateElo {
        constructor() {
            this.startingElo = this.getStartingElo();
            this.k = this.getK();
        }

        getStartingElo() {
            return startingElo;
        }

        getK() {
            return k;
        }

        /**
         * Based on https://www.geeksforgeeks.org/elo-rating-algorithm/
         */
        getExpectedScore(rating1, rating2) {
    		return (
    			(1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400)) // TODO where does 400 come from?
    		);
    	}

        getNewPlayerRating(playerRating, actualScore, expectedScore)
        {
            // actualScore 1 for win, 0 for loss
            return Math.round(playerRating + this.k * (actualScore - expectedScore));
        }
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    // (170:1) {#if !teamsPicked}
    function create_if_block(ctx) {
    	let show_if = /*players*/ ctx[0].filter(func).length > 1;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players*/ 1) show_if = /*players*/ ctx[0].filter(func).length > 1;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(170:1) {#if !teamsPicked}",
    		ctx
    	});

    	return block;
    }

    // (171:2) {#if players.filter(player => player.isPlaying).length > 1 }
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Sort teams";
    			add_location(button, file, 171, 3, 4289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleSortTeams*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(171:2) {#if players.filter(player => player.isPlaying).length > 1 }",
    		ctx
    	});

    	return block;
    }

    // (177:1) <Modal>
    function create_default_slot(ctx) {
    	let recordresults;
    	let current;
    	recordresults = new RecordResults({ $$inline: true });
    	recordresults.$on("recordResults", /*handleResults*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(recordresults.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(recordresults, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(recordresults.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(recordresults.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(recordresults, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(177:1) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let addplayer;
    	let t2;
    	let playerselection;
    	let t3;
    	let t4;
    	let teams;
    	let updating_teamsPicked;
    	let updating_teamsPlayers;
    	let t5;
    	let modal;
    	let current;
    	addplayer = new AddPlayer({ $$inline: true });
    	addplayer.$on("submit", /*handleSubmit*/ ctx[3]);

    	playerselection = new PlayerSelection({
    			props: {
    				players: /*players*/ ctx[0],
    				teamsPicked: /*teamsPicked*/ ctx[2]
    			},
    			$$inline: true
    		});

    	playerselection.$on("playerSelect", /*handlePlayerSelect*/ ctx[5]);
    	let if_block = !/*teamsPicked*/ ctx[2] && create_if_block(ctx);

    	function teams_teamsPicked_binding(value) {
    		/*teams_teamsPicked_binding*/ ctx[10](value);
    	}

    	function teams_teamsPlayers_binding(value) {
    		/*teams_teamsPlayers_binding*/ ctx[11](value);
    	}

    	let teams_props = {};

    	if (/*teamsPicked*/ ctx[2] !== void 0) {
    		teams_props.teamsPicked = /*teamsPicked*/ ctx[2];
    	}

    	if (/*teamsPlayers*/ ctx[1] !== void 0) {
    		teams_props.teamsPlayers = /*teamsPlayers*/ ctx[1];
    	}

    	teams = new Teams({ props: teams_props, $$inline: true });
    	binding_callbacks.push(() => bind(teams, 'teamsPicked', teams_teamsPicked_binding));
    	binding_callbacks.push(() => bind(teams, 'teamsPlayers', teams_teamsPlayers_binding));
    	teams.$on("modifyPlayerPool", /*handleModifyPlayerPool*/ ctx[7]);
    	teams.$on("openRecordResults", /*handleOpenRecordResults*/ ctx[8]);
    	teams.$on("change", /*handleRemovePlayer*/ ctx[4]);
    	teams.$on("click", /*handleSortTeams*/ ctx[6]);

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Elo Teams";
    			t1 = space();
    			create_component(addplayer.$$.fragment);
    			t2 = space();
    			create_component(playerselection.$$.fragment);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			create_component(teams.$$.fragment);
    			t5 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(h1, "class", "svelte-sskd7a");
    			add_location(h1, file, 166, 1, 4057);
    			attr_dev(main, "class", "svelte-sskd7a");
    			add_location(main, file, 165, 0, 4048);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(addplayer, main, null);
    			append_dev(main, t2);
    			mount_component(playerselection, main, null);
    			append_dev(main, t3);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t4);
    			mount_component(teams, main, null);
    			append_dev(main, t5);
    			mount_component(modal, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const playerselection_changes = {};
    			if (dirty & /*players*/ 1) playerselection_changes.players = /*players*/ ctx[0];
    			if (dirty & /*teamsPicked*/ 4) playerselection_changes.teamsPicked = /*teamsPicked*/ ctx[2];
    			playerselection.$set(playerselection_changes);

    			if (!/*teamsPicked*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const teams_changes = {};

    			if (!updating_teamsPicked && dirty & /*teamsPicked*/ 4) {
    				updating_teamsPicked = true;
    				teams_changes.teamsPicked = /*teamsPicked*/ ctx[2];
    				add_flush_callback(() => updating_teamsPicked = false);
    			}

    			if (!updating_teamsPlayers && dirty & /*teamsPlayers*/ 2) {
    				updating_teamsPlayers = true;
    				teams_changes.teamsPlayers = /*teamsPlayers*/ ctx[1];
    				add_flush_callback(() => updating_teamsPlayers = false);
    			}

    			teams.$set(teams_changes);
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addplayer.$$.fragment, local);
    			transition_in(playerselection.$$.fragment, local);
    			transition_in(teams.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addplayer.$$.fragment, local);
    			transition_out(playerselection.$$.fragment, local);
    			transition_out(teams.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(addplayer);
    			destroy_component(playerselection);
    			if (if_block) if_block.d();
    			destroy_component(teams);
    			destroy_component(modal);
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

    function getActivePlayers(players) {
    	const activePlayers = players.filter(player => player.isPlaying);
    	return activePlayers;
    }

    function areArraysIdentical(arr1, arr2) {
    	var i = arr1.length;

    	while (i--) {
    		if (arr1[i] !== arr2[i]) return false;
    	}

    	return true;
    }

    /**
     * https://bost.ocks.org/mike/shuffle/
     * @param items
     */
    function fisherYatesShuffle(items) {
    	let currentIndex = items.length, currentItem, randomIndex;

    	// While there remain elements to shuffle…
    	while (currentIndex) {
    		// Pick a remaining element…
    		randomIndex = Math.floor(Math.random() * currentIndex--);

    		// And swap it with the current element.
    		currentItem = items[currentIndex];

    		items[currentIndex] = items[randomIndex];
    		items[randomIndex] = currentItem;
    	}

    	return items;
    }

    const func = player => player.isPlaying;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const calculateElo = new CalculateElo();
    	let uid = 1;

    	// Hardcoded players for testing - would come from database in practice
    	let players = [
    		{
    			uid: uid++,
    			name: 'David H',
    			isPlaying: false,
    			team: null,
    			elo: 1000
    		},
    		{
    			uid: uid++,
    			name: 'Max',
    			isPlaying: false,
    			team: null,
    			elo: 2000
    		},
    		{
    			uid: uid++,
    			name: 'Matt',
    			isPlaying: false,
    			team: null,
    			elo: 1500
    		}
    	];

    	let teamsPlayers = [];
    	let teamsPicked = false;

    	function handleSubmit(e) {
    		const formData = new FormData(e.target);

    		$$invalidate(0, players = [
    			...players,
    			{
    				uid: uid++,
    				name: formData.get('playerName'),
    				isPlaying: false,
    				team: null,
    				elo: calculateElo.startingElo
    			}
    		]);

    		e.target.reset();
    	}

    	function handleRemovePlayer(e) {
    		$$invalidate(0, players[e.target.name - 1].isPlaying = false, players);
    		$$invalidate(0, players);
    	}

    	function handlePlayerSelect(e) {
    		const uid = e.detail.uid;
    		const isPlaying = e.detail.isPlaying;
    		$$invalidate(0, players[uid - 1].isPlaying = isPlaying, players);
    	}

    	function handleSortTeams() {
    		const activePlayers = getActivePlayers(players);
    		let shuffledPlayers, arePlayersIdentical;

    		// sort the players randomly for now
    		do {
    			shuffledPlayers = fisherYatesShuffle(activePlayers);
    			arePlayersIdentical = areArraysIdentical(shuffledPlayers, teamsPlayers);
    		} while (arePlayersIdentical && teamsPlayers.length > 1);

    		let team;

    		shuffledPlayers.forEach(function (player, i) {
    			team = i % 2 ? 'a' : 'b';
    			player.team = team;
    		});

    		$$invalidate(1, teamsPlayers = shuffledPlayers);
    		$$invalidate(2, teamsPicked = true);
    	}

    	function handleModifyPlayerPool() {
    		$$invalidate(2, teamsPicked = false);
    	}

    	function handleOpenRecordResults() {
    		getModal().open();
    	}

    	function handleResults(e) {
    		const teamAAverageElo = getAverageElo('a');
    		const teamBAverageElo = getAverageElo('b');
    		const teamAExpectedScore = calculateElo.getExpectedScore(teamBAverageElo, teamAAverageElo);
    		const teamBExpectedScore = 1 - teamAExpectedScore;

    		$$invalidate(1, teamsPlayers = teamsPlayers.map(player => {
    			const actualScore = player.team === e.detail.winningTeam ? 1 : 0;

    			const expectedScore = player.team === 'a'
    			? teamAExpectedScore
    			: teamBExpectedScore;

    			const newPlayerRating = calculateElo.getNewPlayerRating(player.elo, actualScore, expectedScore);
    			player.elo = newPlayerRating;
    			return player;
    		}));

    		getModal().close();
    	}

    	function getAverageElo(teamName) {
    		const combinedElo = teamsPlayers.reduce(
    			(previousValue, currentValue) => currentValue.team === teamName
    			? previousValue + currentValue.elo
    			: previousValue,
    			0
    		);

    		const playerCount = teamsPlayers.reduce(
    			(previousValue, currentValue) => currentValue.team === teamName
    			? ++previousValue
    			: previousValue,
    			0
    		);

    		const averageElo = combinedElo / playerCount;
    		return averageElo;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function teams_teamsPicked_binding(value) {
    		teamsPicked = value;
    		$$invalidate(2, teamsPicked);
    	}

    	function teams_teamsPlayers_binding(value) {
    		teamsPlayers = value;
    		$$invalidate(1, teamsPlayers);
    	}

    	$$self.$capture_state = () => ({
    		AddPlayer,
    		PlayerSelection,
    		Teams,
    		RecordResults,
    		Modal,
    		getModal,
    		CalculateElo,
    		calculateElo,
    		uid,
    		players,
    		teamsPlayers,
    		teamsPicked,
    		handleSubmit,
    		handleRemovePlayer,
    		handlePlayerSelect,
    		handleSortTeams,
    		getActivePlayers,
    		areArraysIdentical,
    		fisherYatesShuffle,
    		handleModifyPlayerPool,
    		handleOpenRecordResults,
    		handleResults,
    		getAverageElo
    	});

    	$$self.$inject_state = $$props => {
    		if ('uid' in $$props) uid = $$props.uid;
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    		if ('teamsPlayers' in $$props) $$invalidate(1, teamsPlayers = $$props.teamsPlayers);
    		if ('teamsPicked' in $$props) $$invalidate(2, teamsPicked = $$props.teamsPicked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		players,
    		teamsPlayers,
    		teamsPicked,
    		handleSubmit,
    		handleRemovePlayer,
    		handlePlayerSelect,
    		handleSortTeams,
    		handleModifyPlayerPool,
    		handleOpenRecordResults,
    		handleResults,
    		teams_teamsPicked_binding,
    		teams_teamsPlayers_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
