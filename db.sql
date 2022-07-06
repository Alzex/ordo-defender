create TABLE member(
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL ,
    last_activity DATE DEFAULT NOW(),
    language_code VARCHAR(10) DEFAULT 'en'
    );

create TABLE chat(
    id INTEGER PRIMARY KEY ,
    greet_message VARCHAR(255)
);

create TABLE punishment(
    id SERIAL PRIMARY KEY ,
    reason VARCHAR(255) DEFAULT 'N/A',
    issued_at DATE DEFAULT NOW(),
    disposed_at DATE,
    from_chat_id INT NOT NULL ,
    violator_id INT NOT NULL,
    issuedBy_id INT NOT NULL,
    FOREIGN KEY (from_chat_id) REFERENCES chat (id),
    FOREIGN KEY (violator_id) REFERENCES member (id),
    FOREIGN KEY (issuedBy_id) REFERENCES member (id)
);
