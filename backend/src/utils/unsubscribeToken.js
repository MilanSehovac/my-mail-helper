import jwt from 'jsonwebtoken';

const secret = () => `${process.env.JWT_SECRET}:unsubscribe`;

// Signed, non-expiring token: an unsubscribe link in an old email must keep working.
export const createUnsubscribeToken = (contactId) =>
    jwt.sign({ cid: contactId }, secret(), { algorithm: 'HS256', audience: 'unsubscribe' });

export const verifyUnsubscribeToken = (token) => {
    const payload = jwt.verify(token, secret(), { algorithms: ['HS256'], audience: 'unsubscribe' });
    return payload.cid;
};
