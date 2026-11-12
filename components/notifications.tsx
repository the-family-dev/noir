"use client";
import { Alert } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";

export const Notifications = observer(function Notifications() {
  const { notifications } = store;

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-100 -translate-x-1/2 flex-col gap-2">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          status={notification.status}
          className="pointer-events-auto cursor-pointer shadow-lg"
          onClick={() => store.dismissNotification(notification.id)}
        >
          <Alert.Content>
            <Alert.Title>{notification.message}</Alert.Title>
          </Alert.Content>
        </Alert>
      ))}
    </div>
  );
});
