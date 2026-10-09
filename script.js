
const fromBase = document.getElementById("fromBase");
const toBase = document.getElementById("toBase");
const numberInput = document.getElementById("numberInput");
const resultValue = document.getElementById("resultValue");
const resultLabel = document.getElementById("resultLabel");
const inputHint = document.getElementById("inputHint");
const errorMessage = document.getElementById("errorMessage");
const resultNote = document.getElementById("resultNote");
const copyResult = document.getElementById("copyResult");
const clearInput = document.getElementById("clearInput");
const swapBases = document.getElementById("swapBases");

const systems = {
  2: { name: "BINARY", label: "Binary", digits: "0 and 1" },
  8: { name: "OCTAL", label: "Octal", digits: "0–7" },
  10: { name: "DECIMAL", label: "Decimal", digits: "0–9" },
  16: { name: "HEXADECIMAL", label: "Hexadecimal", digits: "0–9 and A–F" }
};

let lastResult = "1010";

function parseValue(value, base) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error("Please enter a number to convert.");
  }

  let digits = cleanValue.toUpperCase();

  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }

  if (!digits) {
    throw new Error("Please enter a valid number.");
  }

  const alphabet = "0123456789ABCDEF";
  let result = 0n;

  for (const character of digits) {
    const digit = alphabet.indexOf(character);

    if (digit < 0 || digit >= base) {
      throw new Error(
        `Invalid digit "${character}" for ${systems[base].label}. Use ${systems[base].digits}.`
      );
    }

    result = result * BigInt(base) + BigInt(digit);
  }

  return result;
}

function convertNumber(value, base) {
  return value.toString(base).toUpperCase();
}

function formatNumber(value, base) {
  if (base === 2) return value + "₂";
  if (base === 8) return value + "₈";
  if (base === 10) return value + "₁₀";
  return value + "₁₆";
}

function updateConverter() {
  const sourceBase = Number(fromBase.value);
  const targetBase = Number(toBase.value);

  inputHint.textContent =
    `${systems[sourceBase].label}: use ${systems[sourceBase].digits}.`;

  resultLabel.textContent =
    `${systems[targetBase].name} · BASE ${targetBase}`;

  errorMessage.textContent = "";
  numberInput.setAttribute("aria-invalid", "false");

  try {
    const original = numberInput.value;
    const numericValue = parseValue(original, sourceBase);
    const converted = convertNumber(numericValue, targetBase);

    resultValue.textContent = converted;
    resultNote.textContent =
      `${original.trim().toUpperCase()} in ${systems[sourceBase].label.toLowerCase()} is ${converted} in ${systems[targetBase].label.toLowerCase()}.`;

    lastResult = converted;
    copyResult.disabled = false;
  } catch (error) {
    resultValue.textContent = "—";
    resultNote.textContent = "Enter a valid number to see your result.";
    errorMessage.textContent = error.message;
    numberInput.setAttribute("aria-invalid", "true");
    lastResult = "";
    copyResult.disabled = true;
  }
}

numberInput.addEventListener("input", updateConverter);
fromBase.addEventListener("change", updateConverter);
toBase.addEventListener("change", updateConverter);

swapBases.addEventListener("click", () => {
  const oldSource = fromBase.value;
  fromBase.value = toBase.value;
  toBase.value = oldSource;

  const currentResult = resultValue.textContent;
  if (lastResult && currentResult !== "—") {
    numberInput.value = lastResult;
  }

  updateConverter();
});

clearInput.addEventListener("click", () => {
  numberInput.value = "";
  numberInput.focus();
  updateConverter();
});

copyResult.addEventListener("click", async () => {
  if (!lastResult) return;

  try {
    await navigator.clipboard.writeText(lastResult);
    copyResult.innerHTML = "<span>✓</span> Copied!";
    setTimeout(() => {
      copyResult.innerHTML = "<span>▢</span> Copy result";
    }, 1600);
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = lastResult;
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();

    const copied = document.execCommand("copy");
    temporaryInput.remove();

    copyResult.innerHTML = copied
      ? "<span>✓</span> Copied!"
      : "<span>▢</span> Select result";

    setTimeout(() => {
      copyResult.innerHTML = "<span>▢</span> Copy result";
    }, 1600);
  }
});

document.querySelectorAll(".example-card").forEach((card) => {
  card.addEventListener("click", () => {
    numberInput.value = card.dataset.value;
    fromBase.value = card.dataset.from;
    toBase.value = card.dataset.to;

    updateConverter();

    document.getElementById("converter").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

updateConverter();
