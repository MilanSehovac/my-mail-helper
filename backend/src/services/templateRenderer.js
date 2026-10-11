export const ALLOWED_VARIABLES = [
    'full_name', 'first_name', 'last_name', 'email', 'position', 'status', 'tag',
    'agency_name', 'location', 'website', 'sender_name', 'sender_email', 'current_date',
];

const VARIABLE_PATTERN = /{{\s*(\w+)\s*}}/g;

export const findUnknownVariables = (...texts) => {
    const unknown = new Set();
    for (const text of texts) {
        for (const match of String(text ?? '').matchAll(VARIABLE_PATTERN)) {
            if (!ALLOWED_VARIABLES.includes(match[1])) unknown.add(match[1]);
        }
    }
    return [...unknown];
};

const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

export const buildContext = ({ contact, agency, sender }) => {
    const fullName = (contact.full_name || '').trim();
    const [first = '', ...rest] = fullName.split(/\s+/).filter(Boolean);
    const senderName = [sender.first_name, sender.last_name].filter(Boolean).join(' ');
    return {
        full_name: fullName,
        first_name: first,
        last_name: rest.join(' '),
        email: contact.email || '',
        position: contact.position || '',
        status: contact.status || '',
        tag: contact.tag || '',
        agency_name: agency?.name || '',
        location: agency?.city || '',
        website: agency?.website || '',
        sender_name: senderName,
        sender_email: sender.email || '',
        current_date: new Date().toLocaleDateString('en-GB'),
    };
};

const replaceVariables = (text, context, transform = (v) => v) => {
    const unknown = findUnknownVariables(text);
    if (unknown.length) throw new Error(`Unknown template variable(s): ${unknown.join(', ')}`);
    return String(text).replace(VARIABLE_PATTERN, (_, key) => transform(context[key] ?? ''));
};

/**
 * Renders a plain-text template into subject, text and HTML parts.
 * Values are HTML-escaped in the HTML part; newlines in the body become <br>.
 */
export const renderTemplate = (template, context) => ({
    subject: replaceVariables(template.subject, context).replace(/[\r\n]+/g, ' ').trim(),
    text: replaceVariables(template.body, context),
    html: replaceVariables(escapeHtml(template.body), context, escapeHtml).replace(/\r?\n/g, '<br>\n'),
});
