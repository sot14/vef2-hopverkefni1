-- Bæta við tilbúnum notendum
INSERT INTO
  users
    (id, username, email, password, admin)
  VALUES
    (1, 'admin', 'admin@admin.com', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true); --password: password

INSERT INTO
  users
    (id, username, email, password, admin)
  VALUES
    (2, 'jennsara', 'jenny@sara.is', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', false); --password: 1234