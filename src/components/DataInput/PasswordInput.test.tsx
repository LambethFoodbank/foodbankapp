import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import PasswordInput from "./PasswordInput";
import { getFreeFormTextHandler } from "./inputHandlerFactories";
import userEvent from "@testing-library/user-event";

const mockIDLogger: (logId: string) => void = console.log;

describe("PasswordInput component", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders", () => {
        render(
            <PasswordInput
                label="Password"
                value="password"
                onChange={getFreeFormTextHandler(
                    () => void mockIDLogger("DataInput component test: Password Changed")
                )}
            />
        );
    });

    it("renders without optional props", () => {
        render(<PasswordInput />);
    });

    it("behaves as expected when password visibility is toggled", () => {
        render(<PasswordInput label="My Password" />);

        expect(screen.getByLabelText("My Password")).toHaveAttribute("type", "password");

        fireEvent.click(screen.getByLabelText("Toggle password visibility"));
        expect(screen.getByLabelText("My Password")).toHaveAttribute("type", "text");

        fireEvent.click(screen.getByLabelText("Toggle password visibility"));
        expect(screen.getByLabelText("My Password")).toHaveAttribute("type", "password");
    });

    it("handles changes as expected", async () => {
        const user = userEvent.setup();

        const onChangeMethod = jest.fn();
        const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
            onChangeMethod(event.target.value);
        };

        render(<PasswordInput label="My Password" onChange={unwrapEvent} />);

        const textInput = screen.getByLabelText("My Password");
        await user.type(textInput, "Test Text");

        expect(onChangeMethod).toHaveBeenCalledWith("Test Text");
    });
});
