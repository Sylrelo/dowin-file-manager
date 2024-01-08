FROM rust

RUN cargo install cargo-watch
RUN cargo install diesel_cli --no-default-features --features sqlite
RUN rustup component add rustfmt

WORKDIR /app/back-rs

ENV SHELL /bin/bash
# ENTRYPOINT [ "sleep", "infinity" ]
CMD [ "cargo", "watch", "-x", "'run'" ]