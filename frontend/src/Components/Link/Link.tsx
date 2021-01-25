import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";

import styles from "./LinkButton.module.scss";

interface Props {
  linkToken: string;
  setLinkSuccess: (arg: boolean) => void;
  setItemId: (arg: string) => void;
  setAccessToken: (arg: string) => void;
  setIsItemAccess: (arg: boolean) => void;
  currentPath: string;
}

const Link: React.FC<Props> = (props: Props) => {
  // const [isOauth, setIsOauth] = useState(false);

  const onSuccess = React.useCallback((public_token: string, metadata) => {
    // send public_token to server
    const setToken = async () => {
      const response = await fetch("/api/set_access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token: public_token,
        }),
      });
      if (!response.ok) {
        props.setItemId(`no item_id retrieved`);
        props.setAccessToken(`no access_token retrieved`);
        props.setIsItemAccess(false);
      } else {
        const data = await response.json();
        props.setItemId(data.item_id);
        props.setAccessToken(data.access_token);
        props.setIsItemAccess(true);
      }
    };
    setToken();
    props.setLinkSuccess(true);

    window.history.pushState("", "", "/");
  }, []);

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken,
    onSuccess,
    clientName: "hello world",
    env: "sandbox",
    product: ["auth", "transactions"],
  };

  if (window.location.href.includes("?oauth_state_id=")) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <>
      <Button type="button" large onClick={() => open()} disabled={!ready}>
        Launch Link
      </Button>
    </>
  );
};

Link.displayName = "Link";

export default Link;
